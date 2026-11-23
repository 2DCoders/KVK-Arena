using System.Data;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;

namespace kvk.Badminton.Features.MemberBooking;

public partial class MemberBadmintonBookingController
{
    private const string CashierSlipMarker = "CASHIER-PAYMENT-SLIP";

    internal static string CashierSlipStatus(bool approved, Guid? slipRevision, DateTime due, DateTime now) =>
        approved ? "approved" : due <= now ? "expired" : slipRevision.HasValue ? "ready" : "awaiting_slip";

    private static object CashierSlipSummary(CashierSlipReservation reservation) => new
    {
        Reference = reservation.Id, reservation.CustomerName, reservation.PhoneNumber,
        reservation.FinalAmount, reservation.PaymentDueUtc, reservation.SlipRevision, reservation.SmsSent,
        SlotCount = reservation.FinalSlotAmounts.Length,
        Status = CashierSlipStatus(reservation.Approved, reservation.SlipRevision, reservation.PaymentDueUtc, DateTime.UtcNow)
    };

    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpGet("cashier-slips")]
    public async Task<IActionResult> CashierSlips(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var since = now.AddDays(-7);
        var rows = await db.CashierSlipReservations.AsNoTracking().Where(r => r.PaymentDueUtc >= since)
            .OrderBy(r => r.Approved || r.PaymentDueUtc <= now).ThenByDescending(r => r.CreatedAt)
            .Select(r => new { Reference = r.Id, r.CustomerName, r.PhoneNumber, r.FinalAmount, r.PaymentDueUtc,
                r.SlipRevision, r.SmsSent, SlotCount = r.FinalSlotAmounts.Length, r.Approved }).ToListAsync(ct);
        return Ok(rows.Select(r => new { r.Reference, r.CustomerName, r.PhoneNumber, r.FinalAmount, r.PaymentDueUtc,
            r.SlipRevision, r.SmsSent, r.SlotCount, Status = CashierSlipStatus(r.Approved, r.SlipRevision, r.PaymentDueUtc, now) }));
    }

    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpPost("cashier-slips")]
    public Task<IActionResult> HoldForCashierSlip([FromBody] CashierCustomerRequest request, CancellationToken ct) => Respond(async () =>
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) || request.ExpectedAmount is null)
            throw new InvalidOperationException("Enter customer details and review pricing before holding the slots.");

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var holds = await HoldsAsync(request.HoldToken, ct);
        await LockCourtsAsync(holds.Select(h => h.CourtId), ct);
        var existing = await db.CashierSlipReservations.AsNoTracking().SingleOrDefaultAsync(r => r.HoldToken == request.HoldToken, ct);
        if (existing is not null) return Ok(CashierSlipSummary(existing));

        EnsureActive(holds);
        if (holds.Any(h => !string.IsNullOrEmpty(h.PaymentId)))
            throw new InvalidOperationException("This reservation already has a payment in progress.");
        await EnsureBookableAsync(holds, ct);

        var code = request.CouponCode?.Trim().ToUpperInvariant() ?? "";
        var settings = CashierDiscountSettings.Load();
        var promotion = settings.Price(holds.Select(h => h.Amount).ToArray(), DateOnly.FromDateTime(ColomboNow));
        if (code.Length == 0 && !promotion.IsPromotion)
            throw new InvalidOperationException("Apply an unredeemed coupon before holding the slots.");
        var pricing = await ApplyCashierCouponAsync(promotion, code, settings.CouponLimit, ct);
        if (request.ExpectedAmount != pricing.FinalAmount)
            throw new InvalidOperationException("The booking price changed. Refresh pricing before holding the slots.");

        var reservation = new CashierSlipReservation
        {
            Id = Guid.NewGuid(), HoldToken = request.HoldToken, CustomerName = request.CustomerName.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(), PaymentDueUtc = DateTime.UtcNow.AddHours(12),
            FinalAmount = pricing.FinalAmount, SlotHoldIds = holds.Select(h => h.Id).ToArray(),
            FinalSlotAmounts = pricing.Amounts, IsPromotion = pricing.IsPromotion,
            CouponCode = code.Length > 0 ? code : null, CouponBasePrices = code.Length > 0 ? promotion.Amounts : null,
            LimitedCouponId = settings.CouponCodeId, CouponDiscount = pricing.CouponDiscount
        };
        foreach (var hold in holds)
        {
            hold.PaymentId = CashierSlipMarker;
            hold.ExpiresAt = HoldExpiry(reservation.PaymentDueUtc);
            hold.CustomerName = reservation.CustomerName;
            hold.PhoneNumber = reservation.PhoneNumber;
        }
        db.CashierSlipReservations.Add(reservation);
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(CashierSlipSummary(reservation));
    });

    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpPost("cashier-slips/{reference:guid}/slip")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxSlipBytes + 65536)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxSlipBytes)]
    public Task<IActionResult> UploadCashierSlip(Guid reference, IFormFile slip, CancellationToken ct) => Respond(async () =>
    {
        if (slip.Length is < 1 or > MaxSlipBytes)
            throw new InvalidOperationException("Upload a PDF, PNG or JPEG file up to 5 MB.");
        using var buffer = new MemoryStream();
        await slip.CopyToAsync(buffer, ct);
        var bytes = buffer.ToArray();
        var contentType = SlipType(bytes) ?? throw new InvalidOperationException("Upload a valid PDF, PNG or JPEG payment slip.");

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var reservation = await db.CashierSlipReservations.SingleOrDefaultAsync(r => r.Id == reference, ct);
        if (reservation is null) return NotFound();
        var holds = await HoldsAsync(reservation.HoldToken, ct);
        await LockCourtsAsync(holds.Select(h => h.CourtId), ct);
        if (reservation.Approved || reservation.PaymentDueUtc <= DateTime.UtcNow)
            throw new InvalidOperationException("This reservation is no longer accepting payment slips.");
        EnsureActive(holds);
        reservation.Slip = bytes;
        reservation.SlipRevision = Guid.NewGuid();
        reservation.SlipContentType = contentType;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(CashierSlipSummary(reservation));
    });

    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpGet("cashier-slips/{reference:guid}/slip")]
    public async Task<IActionResult> DownloadCashierSlip(Guid reference, CancellationToken ct)
    {
        var slip = await db.CashierSlipReservations.AsNoTracking().Where(r => r.Id == reference)
            .Select(r => new { r.Slip, r.SlipContentType }).SingleOrDefaultAsync(ct);
        if (slip?.Slip is null || slip.SlipContentType is null) return NotFound();
        var extension = slip.SlipContentType switch { "image/png" => "png", "image/jpeg" => "jpg", _ => "pdf" };
        return File(slip.Slip, slip.SlipContentType, $"payment-slip-{reference:N}.{extension}");
    }

    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpPost("cashier-slips/{reference:guid}/approve/{slipRevision:guid}")]
    public Task<IActionResult> ApproveCashierSlip(Guid reference, Guid slipRevision, CancellationToken ct) => Respond(async () =>
    {
        CashierSlipReservation reservation;
        await using (var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct))
        {
            var found = await db.CashierSlipReservations.SingleOrDefaultAsync(r => r.Id == reference, ct);
            if (found is null) return NotFound();
            reservation = found;
            if (reservation.Approved) return Ok(CashierSlipSummary(reservation));
            if (reservation.Slip is not { Length: > 0 } || reservation.SlipRevision is null)
                throw new InvalidOperationException("Upload a payment slip before approving this booking.");
            if (reservation.SlipRevision != slipRevision)
                return Conflict(new { Message = "The payment slip was replaced. Open the latest slip before approving." });

            var holds = await HoldsAsync(reservation.HoldToken, ct);
            await LockCourtsAsync(holds.Select(h => h.CourtId), ct);
            if (reservation.PaymentDueUtc <= DateTime.UtcNow)
                throw new InvalidOperationException("The 12-hour hold has expired.");
            EnsureActive(holds);
            await EnsureBookableAsync(holds, ct);
            var pricesByHold = reservation.SlotHoldIds.Zip(reservation.FinalSlotAmounts).ToDictionary(pair => pair.First, pair => pair.Second);
            if (pricesByHold.Count != holds.Count || holds.Any(hold => !pricesByHold.ContainsKey(hold.Id)))
                throw new InvalidOperationException("The reserved slots no longer match the reviewed amount.");

            if (reservation.CouponCode is { } code)
            {
                var coupon = await coupons.RedeemAsync(code, reservation.CouponBasePrices!, transaction.GetDbTransaction(), ct,
                    new CashierCouponLimit(reservation.LimitedCouponId));
                if (!coupon.IsValid) throw new InvalidOperationException(coupon.ErrorMessage);
                if (coupon.DiscountAmount != reservation.CouponDiscount)
                    throw new InvalidOperationException("The coupon price changed after the slots were held.");
            }

            foreach (var hold in holds)
            {
                db.CourtBookings.Add(new CourtBooking
                {
                    CourtId = hold.CourtId, CourtSlotId = hold.CourtSlotId, BookingDate = hold.BookingDate,
                    BookingAmount = pricesByHold[hold.Id], Status = BookingStatus.Confirmed,
                    CustomerName = reservation.CustomerName, PhoneNumber = reservation.PhoneNumber,
                    PaymentType = PaymentTypes.BankTransfer, PaymentId = Key(reservation.HoldToken),
                    BookingNumber = $"BCKG-{Guid.NewGuid():N}",
                    Notes = $"Staff-approved payment slip {reference:N}.{(reservation.IsPromotion ? " Promotion." : "")}"
                });
                hold.Status = BookingHoldStatus.Confirmed;
            }
            reservation.Approved = true;
            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }

        try
        {
            var message = $"Hi {reservation.CustomerName}, your KVK Badminton booking has been confirmed. Reference: {reference:N}.";
            reservation.SmsSent = (await sms.SendSingleMessageAsync(reservation.PhoneNumber, message, CancellationToken.None)).Succeeded;
            if (reservation.SmsSent)
                await db.CashierSlipReservations.Where(r => r.Id == reference)
                    .ExecuteUpdateAsync(update => update.SetProperty(r => r.SmsSent, true), CancellationToken.None);
            else logger.LogWarning("Confirmation SMS failed for staff badminton reservation {Reference}", reference);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Confirmation SMS failed for staff badminton reservation {Reference}", reference);
        }
        return Ok(CashierSlipSummary(reservation));
    });
}
