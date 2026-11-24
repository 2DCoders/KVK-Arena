using System.Data;
using System.Text.RegularExpressions;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.Gaming.Domain;
using kvk.Gaming.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace kvk.Gaming.Features.GamingBooking;

[Authorize(Policy = ModuleConstants.GamingCashierSlipsPermission)]
[ApiController]
[Route("api/gaming-m/gaming-bookings/cashier-slips")]
public class GamingCashierSlipsController(GamingDbContext db, ISmsService sms, ILogger<GamingCashierSlipsController> logger) : ControllerBase
{
    internal const string PaymentPrefix = "GAMING-CASHIER-SLIP:";
    private const int MaxSlipBytes = 5 * 1024 * 1024;
    private static readonly TimeZoneInfo Colombo = TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo");
    public record ReserveRequest(List<Guid> HoldIds, string CustomerName, string PhoneNumber, decimal ExpectedAmount);

    private static object Summary(Guid id, string name, string phone, decimal amount, DateTime deadline,
        int slots, Guid? revision, bool approved, bool smsSent) => new
    {
        id, customerName = name, phoneNumber = phone, amount, paymentDueUtc = deadline, slotCount = slots, revision, approved, smsSent
    };

    private static object Summary(GamingCashierSlip x) =>
        Summary(x.Id, x.CustomerName, x.PhoneNumber, x.Amounts.Sum(), x.PaymentDueUtc, x.HoldIds.Length, x.Revision, x.Approved, x.SmsSent);

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var since = DateTime.UtcNow.AddDays(-7);
        var rows = await db.GamingCashierSlips.AsNoTracking().Where(x => x.PaymentDueUtc >= since)
            .OrderByDescending(x => x.CreatedAt).Select(x => new
            {
                x.Id, x.CustomerName, x.PhoneNumber, x.Amounts, x.PaymentDueUtc, SlotCount = x.HoldIds.Length, x.Revision, x.Approved, x.SmsSent
            }).ToListAsync(ct);
        return Ok(rows.Select(x => Summary(x.Id, x.CustomerName, x.PhoneNumber, x.Amounts.Sum(), x.PaymentDueUtc,
            x.SlotCount, x.Revision, x.Approved, x.SmsSent)));
    }

    [HttpPost]
    public Task<IActionResult> Reserve(ReserveRequest request, CancellationToken ct) => Write(async () =>
    {
        var phone = request.PhoneNumber?.Trim() ?? "";
        if (request.HoldIds is not { Count: > 0 } || request.HoldIds.Distinct().Count() != request.HoldIds.Count ||
            string.IsNullOrWhiteSpace(request.CustomerName) || !Regex.IsMatch(phone, @"\A07[0-9]{8}\z"))
            return BadRequest(new { message = "Select held slots and enter a customer name and valid mobile number." });

        var id = request.HoldIds.Min();
        var holdIds = request.HoldIds.Order().ToList();
        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var previous = await db.GamingCashierSlips.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (previous != null)
            return previous.HoldIds.SequenceEqual(holdIds) ? Ok(Summary(previous)) : Conflict(new { message = "These slots are already reserved." });

        var holds = await LoadHolds(holdIds, ct);
        var slots = await LoadActiveSlots(holds, ct);
        var now = DateTime.UtcNow;
        if (holds.Count != holdIds.Count || holds.Select(x => (x.GamingSlotId, x.BookingDate)).Distinct().Count() != holds.Count ||
            holds.Any(x => !string.IsNullOrEmpty(x.PaymentIntentId)) || !await AreAvailable(holds, slots, now, ct))
            return Conflict(new { message = "One or more slots are no longer available." });
        var amounts = holds.Select(hold => slots[hold.GamingSlotId].Price +
            hold.AdditionalPurchases.Sum(x => x.Quantity * x.UnitPrice)).ToArray();
        if (holds.SelectMany(x => x.AdditionalPurchases).Any(x => x.Quantity <= 0 || x.UnitPrice < 0) ||
            request.ExpectedAmount != amounts.Sum())
            return Conflict(new { message = "The booking price changed. Select the slots again." });
        var firstEnd = holds.Min(hold => EndUtc(hold.BookingDate, slots[hold.GamingSlotId]));
        var limit = now.AddHours(12);
        var due = firstEnd < limit ? firstEnd : limit;
        var reservation = new GamingCashierSlip
        {
            Id = id, HoldIds = holdIds.ToArray(), Amounts = amounts, PaymentDueUtc = due,
            CustomerName = request.CustomerName.Trim(), PhoneNumber = phone
        };
        foreach (var hold in holds)
        {
            hold.PaymentIntentId = PaymentPrefix + id.ToString("N");
            hold.ExpiresAt = DateTime.SpecifyKind(due.ToLocalTime(), DateTimeKind.Unspecified);
        }
        db.Add(reservation);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Ok(Summary(reservation));
    });

    [HttpPost("{id:guid}/slip")]
    [RequestSizeLimit(MaxSlipBytes + 65536)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxSlipBytes)]
    public Task<IActionResult> Upload(Guid id, IFormFile slip, CancellationToken ct) => Write(async () =>
    {
        if (slip.Length is < 1 or > MaxSlipBytes) return BadRequest(new { message = "Upload a PDF, PNG or JPEG file up to 5 MB." });
        using var stream = new MemoryStream();
        await slip.CopyToAsync(stream, ct);
        var bytes = stream.ToArray();
        var type = FileType(bytes);
        if (type is null) return BadRequest(new { message = "Upload a valid PDF, PNG or JPEG file." });

        await using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var row = await db.GamingCashierSlips.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return NotFound();
        if (row.Approved || row.PaymentDueUtc <= DateTime.UtcNow)
            return Conflict(new { message = "This hold is no longer accepting slips." });
        row.Document = bytes;
        row.ContentType = type;
        row.Revision = Guid.NewGuid();
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
        return Ok(Summary(row));
    });

    [HttpGet("{id:guid}/slip")]
    public async Task<IActionResult> Download(Guid id, CancellationToken ct)
    {
        var file = await db.GamingCashierSlips.AsNoTracking().Where(x => x.Id == id)
            .Select(x => new { x.Document, x.ContentType }).SingleOrDefaultAsync(ct);
        return file?.Document is byte[] bytes && file.ContentType is string type
            ? File(bytes, type, $"gaming-slip-{id:N}.{(type == "image/png" ? "png" : type == "image/jpeg" ? "jpg" : "pdf")}")
            : NotFound();
    }

    [HttpPost("{id:guid}/approve/{revision:guid}")]
    public Task<IActionResult> Approve(Guid id, Guid revision, CancellationToken ct) => Write(async () =>
    {
        GamingCashierSlip row;
        await using (var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct))
        {
            var found = await db.GamingCashierSlips.SingleOrDefaultAsync(x => x.Id == id, ct);
            if (found is null) return NotFound();
            row = found;
            if (row.Approved) return Ok(Summary(row));
            if (row.PaymentDueUtc <= DateTime.UtcNow || row.Revision != revision || row.Document is not { Length: > 0 })
                return Conflict(new { message = "The hold expired or the payment slip changed. Refresh before approving." });
            var holds = await LoadHolds(row.HoldIds.ToList(), ct);
            var slots = await LoadActiveSlots(holds, ct);
            var reference = PaymentPrefix + id.ToString("N");
            if (holds.Count != row.HoldIds.Length || holds.Count != row.Amounts.Length || holds.Any(x => x.PaymentIntentId != reference) ||
                !await AreAvailable(holds, slots, DateTime.UtcNow, ct))
                return Conflict(new { message = "One or more slots are no longer available." });

            foreach (var (hold, amount) in holds.Zip(row.Amounts))
            {
                db.GamingBookings.Add(new Domain.GamingBooking
                {
                    BookingNumber = $"GAM-{Guid.NewGuid():N}",
                    GamingCategoryId = hold.GamingCategoryId, GamingStationId = hold.GamingStationId,
                    GamingSlotId = hold.GamingSlotId, BookingDate = hold.BookingDate,
                    CustomerName = row.CustomerName, CustomerPhone = row.PhoneNumber,
                    Amount = amount, Status = GamingBookingStatus.Confirmed, PaymentIntentId = reference,
                    PaymentType = PaymentTypes.BankTransfer,
                    AdditionalPurchases = hold.AdditionalPurchases.Select(x => new GamingBookingAdditionalPurchase
                    {
                        AdditionalPurchaseId = x.AdditionalPurchaseId, Quantity = x.Quantity, UnitPrice = x.UnitPrice
                    }).ToList()
                });
                hold.Status = GamingBookingHoldStatus.Confirmed;
            }
            row.Approved = true;
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        try
        {
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(15));
            var sent = await sms.SendSingleMessageAsync(row.PhoneNumber,
                $"Hi {row.CustomerName}, your KVK Arena Gaming booking has been confirmed. Thank you!", timeout.Token);
            if (sent.Succeeded)
            {
                await db.GamingCashierSlips.Where(x => x.Id == id)
                    .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.SmsSent, true), CancellationToken.None);
                row.SmsSent = true;
            }
            else logger.LogWarning("Gaming booking SMS failed for slip {SlipId}", id);
        }
        catch (Exception ex)
        {
            logger.LogWarning("Gaming booking SMS failed for slip {SlipId}: {ErrorType}", id, ex.GetType().Name);
        }
        return Ok(Summary(row));
    });

    private Task<List<GamingBookingHold>> LoadHolds(List<Guid> ids, CancellationToken ct) =>
        db.GamingBookingHolds.Include(x => x.AdditionalPurchases).Where(x => ids.Contains(x.Id)).OrderBy(x => x.Id).ToListAsync(ct);

    private Task<Dictionary<Guid, GamingSlot>> LoadActiveSlots(List<GamingBookingHold> holds, CancellationToken ct)
    {
        var slotIds = holds.Select(x => x.GamingSlotId).Distinct().ToList();
        return db.GamingSlots.AsNoTracking().Where(x => slotIds.Contains(x.Id) && x.IsActive &&
            x.GamingStation.IsActive && x.GamingCategory.IsActive).ToDictionaryAsync(x => x.Id, ct);
    }

    private async Task<bool> AreAvailable(List<GamingBookingHold> holds, Dictionary<Guid, GamingSlot> slots, DateTime utc, CancellationToken ct)
    {
        if (holds.Any(x => x.Status != GamingBookingHoldStatus.Pending || x.ExpiresAt <= utc.ToLocalTime() ||
            !slots.TryGetValue(x.GamingSlotId, out var slot) || slot.GamingStationId != x.GamingStationId ||
            slot.GamingCategoryId != x.GamingCategoryId || EndUtc(x.BookingDate, slot) <= utc))
            return false;
        var slotIds = slots.Keys.ToList();
        var dates = holds.Select(x => x.BookingDate).Distinct().ToList();
        var booked = await db.GamingBookings.Where(x => slotIds.Contains(x.GamingSlotId) && dates.Contains(x.BookingDate) &&
            x.Status != GamingBookingStatus.Cancelled).Select(x => new { x.GamingSlotId, x.BookingDate }).ToListAsync(ct);
        return !holds.Any(hold => booked.Any(x => x.GamingSlotId == hold.GamingSlotId && x.BookingDate == hold.BookingDate));
    }

    private static DateTime EndUtc(DateOnly date, GamingSlot slot) => TimeZoneInfo.ConvertTimeToUtc(
        (slot.EndTime <= slot.StartTime ? date.AddDays(1) : date).ToDateTime(slot.EndTime), Colombo);

    private static string? FileType(ReadOnlySpan<byte> bytes)
    {
        if (bytes.StartsWith("%PDF-"u8)) return "application/pdf";
        if (bytes.StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return "image/png";
        return bytes.StartsWith(new byte[] { 255, 216, 255 }) ? "image/jpeg" : null;
    }

    private async Task<IActionResult> Write(Func<Task<IActionResult>> action)
    {
        try { return await action(); }
        catch (Exception ex) when (ex.GetBaseException() is PostgresException
            { SqlState: PostgresErrorCodes.SerializationFailure or PostgresErrorCodes.DeadlockDetected or PostgresErrorCodes.UniqueViolation })
        {
            return Conflict(new { message = "The reservation changed. Refresh and try again." });
        }
    }
}
