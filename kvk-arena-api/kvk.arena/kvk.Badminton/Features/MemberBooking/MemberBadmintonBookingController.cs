using System.Data;
using System.Globalization;
using System.Text.Json;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Services;
using Microsoft.Extensions.Options;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Npgsql;
using BookingCourt = kvk.Badminton.Domain.Court;

namespace kvk.Badminton.Features.MemberBooking;

// Public coupon-booking flow. Cashier and temporary-booking endpoints remain separate.
[ApiController]
[Route("api/member-badminton-bookings")]
public class MemberBadmintonBookingController(BadmintonDbContext db, IReservationCouponService coupons,
    IConfiguration configuration, IHashService hashes, IOptions<PayHereOptions> paymentOptions) : ControllerBase
{
    private const int HoldSeconds = 7 * 60;
    private static DateTime Now => DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
    private static DateTime ColomboNow => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo"));
    private static string Key(Guid token) => $"MEMBER:{token:N}";
    private int MaximumWeeks => Math.Clamp(configuration.GetValue("MemberBadmintonBooking:MaximumWeeks", 52), 1, 52);

    private async Task<BookingCourt> CourtAsync(CancellationToken ct)
    {
        var configured = configuration.GetValue<Guid?>("MemberBadmintonBooking:CourtId");
        return await db.Courts.AsNoTracking().Where(c => c.Status == CourtStatus.Active && (!configured.HasValue || c.Id == configured))
            .OrderBy(c => c.Name).ThenBy(c => c.Id).FirstOrDefaultAsync(ct)
            ?? throw new InvalidOperationException("The booking court is not available right now.");
    }

    [HttpGet("setup")]
    public Task<IActionResult> Setup(CancellationToken ct) => Respond(async () =>
    {
        var court = await CourtAsync(ct);
        var slots = await db.CourtSlots.AsNoTracking().Where(s => s.CourtId == court.Id && s.IsActive)
            .OrderBy(s => s.StartTime).Select(s => new { SlotId = s.Id, s.CourtId, s.StartTime, s.EndTime, s.Price }).ToListAsync(ct);
        return Ok(new { Court = new { court.Id, court.Name }, Slots = slots, MaximumWeeks });
    });

    private sealed record ScheduleData(BookingCourt Court, List<CourtSlot> Slots, List<DateOnly> Dates, DateOnly EndDate)
    {
        public decimal Amount => Slots.Sum(s => s.Price) * Dates.Count;
        public List<decimal> Prices => Dates.SelectMany(_ => Slots.Select(s => s.Price)).ToList();
    }
    private async Task<ScheduleData> ScheduleAsync(MemberScheduleRequest request, CancellationToken ct)
    {
        if (request.StartDate == default || request.StartDate < DateOnly.FromDateTime(ColomboNow) || request.Weeks < 1 || request.Weeks > MaximumWeeks)
            throw new InvalidOperationException("Choose a valid future start date and duration.");
        if (request.DaysOfWeek is not { Count: > 0 } || request.DaysOfWeek.Any(day => !Enum.IsDefined(day)) || request.DaysOfWeek.Distinct().Count() != request.DaysOfWeek.Count ||
            request.SlotIds is not { Count: > 0 } || request.SlotIds.Distinct().Count() != request.SlotIds.Count)
            throw new InvalidOperationException("Choose valid booking days and time slots.");
        var court = await CourtAsync(ct);
        var slots = await db.CourtSlots.AsNoTracking().Where(s => s.CourtId == court.Id && s.IsActive && request.SlotIds.Contains(s.Id)).OrderBy(s => s.StartTime).ToListAsync(ct);
        if (slots.Count != request.SlotIds.Count || slots.Any(s => s.Price < 0)) throw new InvalidOperationException("One or more selected slots are unavailable.");
        for (var i = 1; i < slots.Count; i++)
            if (slots[i - 1].EndTime != slots[i].StartTime) throw new InvalidOperationException("Choose consecutive time slots without gaps.");
        return new(court, slots, MemberSchedule.Dates(request.StartDate, request.Weeks, request.DaysOfWeek), MemberSchedule.EndDate(request.StartDate, request.Weeks));
    }

    private async Task<List<object>> ConflictsAsync(ScheduleData schedule, CancellationToken ct)
    {
        var ids = schedule.Slots.Select(s => s.Id).ToList();
        var dates = schedule.Dates;
        var now = Now;
        var booked = await db.CourtBookings.AsNoTracking().Where(b => ids.Contains(b.CourtSlotId) && dates.Contains(b.BookingDate) && b.Status != BookingStatus.Cancelled)
            .Select(b => new { b.CourtSlotId, b.BookingDate }).ToListAsync(ct);
        var held = await db.BookingHolds.AsNoTracking().Where(h => ids.Contains(h.CourtSlotId) && dates.Contains(h.BookingDate) && h.Status == BookingHoldStatus.Pending && h.ExpiresAt > now)
            .Select(h => new { h.CourtSlotId, h.BookingDate }).ToListAsync(ct);
        var taken = booked.Concat(held).Select(x => (x.CourtSlotId, x.BookingDate)).ToHashSet();
        var local = ColomboNow;
        return dates.SelectMany(date => schedule.Slots.Where(slot => taken.Contains((slot.Id, date)) ||
                (date == DateOnly.FromDateTime(local) && slot.StartTime <= TimeOnly.FromDateTime(local)))
            .Select(slot => (object)new { Date = date, SlotId = slot.Id, SlotName = $"{slot.StartTime:HH:mm} - {slot.EndTime:HH:mm}", Message = "This session is booked, held or has already started." })).ToList();
    }

    [HttpPost("check-availability")]
    public Task<IActionResult> CheckAvailability([FromBody] MemberScheduleRequest request, CancellationToken ct) => Respond(async () =>
    {
        var schedule = await ScheduleAsync(request, ct);
        var conflicts = await ConflictsAsync(schedule, ct);
        return Ok(new { IsAvailable = conflicts.Count == 0, OriginalAmount = schedule.Amount, schedule.EndDate, BookingCount = schedule.Dates.Count * schedule.Slots.Count, UnavailableSchedules = conflicts });
    });

    private Task LockCourtAsync(Guid courtId, CancellationToken ct) => db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({courtId.ToString()}, 0))", ct);

    [HttpPost("hold")]
    public Task<IActionResult> Hold([FromBody] MemberScheduleRequest request, CancellationToken ct) => Respond(async () =>
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var schedule = await ScheduleAsync(request, ct);
        await LockCourtAsync(schedule.Court.Id, ct);
        if ((await ConflictsAsync(schedule, ct)).Count > 0) throw new InvalidOperationException("Some sessions are no longer available. Please check your schedule again.");
        var token = Guid.NewGuid();
        var expiry = Now.AddSeconds(HoldSeconds);
        foreach (var date in schedule.Dates)
            foreach (var slot in schedule.Slots)
                db.BookingHolds.Add(new BookingHold { CourtId = schedule.Court.Id, CourtSlotId = slot.Id, BookingDate = date, Amount = slot.Price, Status = BookingHoldStatus.Pending, ExpiresAt = expiry, PaymentIntentId = Key(token) });
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { HoldToken = token, ExpiresInSeconds = Math.Max(0, (int)(expiry - Now).TotalSeconds), OriginalAmount = schedule.Amount, schedule.EndDate, BookingCount = schedule.Prices.Count });
    });

    private async Task<List<BookingHold>> HoldsAsync(Guid token, CancellationToken ct)
    {
        if (token == Guid.Empty) throw new InvalidOperationException("A valid reservation is required.");
        var key = Key(token);
        var holds = await db.BookingHolds.Include(h => h.CourtSlot).Where(h => h.PaymentIntentId == key).OrderBy(h => h.BookingDate).ThenBy(h => h.CourtSlot.StartTime).ToListAsync(ct);
        if (holds.Count == 0) throw new InvalidOperationException("This reservation could not be found. Please select your sessions again.");
        return holds;
    }
    private static void EnsureActive(List<BookingHold> holds)
    {
        if (holds.Any(h => h.Status != BookingHoldStatus.Pending || h.ExpiresAt <= Now))
            throw new InvalidOperationException("Your reservation has expired. Please select your sessions again.");
    }

    [HttpPost("coupon")]
    public Task<IActionResult> Coupon([FromBody] MemberCouponRequest request, CancellationToken ct) => Respond(async () =>
    {
        var holds = await HoldsAsync(request.HoldToken, ct);
        EnsureActive(holds);
        var quote = await coupons.QuoteAsync(request.CouponCode, holds.Select(h => h.Amount).ToList(), ct);
        if (!quote.IsValid) throw new InvalidOperationException(quote.ErrorMessage);
        var total = holds.Sum(h => h.Amount);
        return Ok(new { OriginalAmount = total, quote.DiscountAmount, FinalAmount = total - quote.DiscountAmount });
    });

    [HttpDelete("hold/{token:guid}")]
    public Task<IActionResult> Release(Guid token, CancellationToken ct) => Respond(async () =>
    {
        var key = Key(token);
        var existing = await db.BookingHolds.AsNoTracking().Where(h => h.PaymentIntentId == key).ToListAsync(ct);
        var payment = ReadPayment(existing.FirstOrDefault());
        if (payment is not null && (payment.Status is "paid" or "review" || payment.Status == "pending" && existing.Any(h => h.ExpiresAt > Now)))
            throw new InvalidOperationException("Please check your payment status before releasing this reservation.");
        await db.BookingHolds.Where(h => h.PaymentIntentId == key && h.Status == BookingHoldStatus.Pending)
            .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.Status, BookingHoldStatus.Released), ct);
        return Ok(new { Succeeded = true });
    });

    private async Task<IActionResult> FinalizeVerifiedPayment(Guid token, MemberPaymentState payment, CancellationToken ct)
    {
        if (payment.Status != "paid") throw new InvalidOperationException("Payment has not been verified.");
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var holds = await HoldsAsync(token, ct);
        await LockCourtAsync(holds[0].CourtId, ct);
        var key = Key(token);
        if (holds.All(h => h.Status == BookingHoldStatus.Confirmed))
        {
            var existing = await db.CourtBookings.AsNoTracking().Where(b => b.PaymentId == key).Select(b => new { b.BookingNumber, b.BookingDate, b.BookingAmount }).ToListAsync(ct);
            return Ok(new { Succeeded = true, Bookings = existing, FinalAmount = existing.Sum(b => b.BookingAmount) });
        }
        if (holds.Any(h => h.Status is BookingHoldStatus.Released or BookingHoldStatus.Confirmed))
            throw new InvalidOperationException("The paid reservation needs review. Please contact KVK Arena.");
        var slotIds = holds.Select(h => h.CourtSlotId).Distinct().ToList();
        var dates = holds.Select(h => h.BookingDate).Distinct().ToList();
        if (holds.Any(h => !h.CourtSlot.IsActive) || await db.Courts.AnyAsync(c => c.Id == holds[0].CourtId && c.Status != CourtStatus.Active, ct))
            throw new InvalidOperationException("The court or selected sessions are no longer available.");
        if (await db.CourtBookings.AnyAsync(b => slotIds.Contains(b.CourtSlotId) && dates.Contains(b.BookingDate) && b.Status != BookingStatus.Cancelled, ct))
            throw new InvalidOperationException("Some sessions are no longer available. Please select your schedule again.");
        var now = Now;
        if (await db.BookingHolds.AnyAsync(h => h.PaymentIntentId != key && slotIds.Contains(h.CourtSlotId) && dates.Contains(h.BookingDate) && h.Status == BookingHoldStatus.Pending && h.ExpiresAt > now, ct))
            throw new InvalidOperationException("The paid sessions need review. Please contact KVK Arena.");
        var quote = await coupons.RedeemAsync(payment.CouponCode, holds.Select(h => h.Amount).ToList(), transaction.GetDbTransaction(), ct);
        if (!quote.IsValid) throw new InvalidOperationException(quote.ErrorMessage);
        var original = holds.Sum(h => h.Amount);
        if (original != payment.OriginalAmount || quote.DiscountAmount != payment.DiscountAmount || original - quote.DiscountAmount != payment.Amount)
            throw new InvalidOperationException("Payment pricing needs review. Please contact KVK Arena.");
        var final = original - quote.DiscountAmount;
        var amounts = MemberSchedule.Amounts(holds.Select(h => h.Amount).ToList(), quote.DiscountAmount);
        var bookings = new List<CourtBooking>();
        for (var i = 0; i < holds.Count; i++)
        {
            var hold = holds[i];
            var amount = amounts[i];
            var booking = new CourtBooking { CourtId = hold.CourtId, CourtSlotId = hold.CourtSlotId, BookingDate = hold.BookingDate, BookingAmount = amount,
                Status = BookingStatus.Confirmed, CustomerName = holds[0].CustomerName, PhoneNumber = holds[0].PhoneNumber, PaymentType = PaymentTypes.Card,
                PaymentId = key, BookingNumber = $"BCKG-{Guid.NewGuid():N}", Notes = $"Coupon: {payment.CouponCode}. PayHere payment: {payment.GatewayPaymentId}." };
            bookings.Add(booking);
            db.CourtBookings.Add(booking);
            hold.Status = BookingHoldStatus.Confirmed;
            hold.CustomerName = booking.CustomerName;
            hold.PhoneNumber = booking.PhoneNumber;
        }
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { Succeeded = true, OriginalAmount = original, quote.DiscountAmount, FinalAmount = final, Bookings = bookings.Select(b => new { b.BookingNumber, b.BookingDate, b.BookingAmount }) });
    }

    private sealed class MemberPaymentState
    {
        public string OrderId { get; set; } = "";
        public string CouponCode { get; set; } = "";
        public string Email { get; set; } = "";
        public string Currency { get; set; } = "LKR";
        public decimal OriginalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = "pending";
        public string? GatewayPaymentId { get; set; }
        public List<MemberPaymentState> PreviousAttempts { get; set; } = [];
    }
    // Existing hold payment metadata persists the prepared order and verified result across refreshes.
    private static MemberPaymentState? ReadPayment(BookingHold? hold) =>
        string.IsNullOrWhiteSpace(hold?.PaymentId) ? null : JsonSerializer.Deserialize<MemberPaymentState>(hold.PaymentId);
    private async Task SavePayment(List<BookingHold> holds, MemberPaymentState state, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(state);
        foreach (var hold in holds) hold.PaymentId = json;
        await db.SaveChangesAsync(ct);
    }

    [HttpPost("payment")]
    public Task<IActionResult> StartPayment([FromBody] MemberConfirmRequest request, CancellationToken ct) => Respond(async () =>
    {
        var options = paymentOptions.Value;
        if (string.IsNullOrWhiteSpace(options.MerchantId) || string.IsNullOrWhiteSpace(options.MerchantSecret))
            throw new InvalidOperationException("Online payments are not available right now. Please contact KVK Arena.");
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var holds = await HoldsAsync(request.HoldToken, ct);
        await LockCourtAsync(holds[0].CourtId, ct);
        EnsureActive(holds);
        var payment = ReadPayment(holds[0]);
        if (payment is not null && payment.Status is not ("reversed" or "failed"))
            throw new InvalidOperationException("A payment already exists for this reservation. Please check its status before paying again.");
        var history = payment?.PreviousAttempts.ToList() ?? [];
        if (payment is not null) { payment.PreviousAttempts = []; history.Add(payment); }
        var code = request.CouponCode.Trim().ToUpperInvariant();
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({code}, 1))", ct);
        var now = Now;
        var otherPayments = await db.BookingHolds.AsNoTracking().Where(h => h.PaymentIntentId != Key(request.HoldToken) && h.PaymentIntentId != null &&
            h.PaymentIntentId.StartsWith("MEMBER:") && h.PaymentId != null && h.PaymentId.Contains(code) && h.Status == BookingHoldStatus.Pending && h.ExpiresAt > now).ToListAsync(ct);
        if (otherPayments.Any(h => ReadPayment(h) is { Status: "pending" or "paid" } state && state.CouponCode == code))
            throw new InvalidOperationException("This coupon is already being used in another checkout. Please complete that payment first.");
        var quote = await coupons.QuoteAsync(code, holds.Select(h => h.Amount).ToList(), ct);
        if (!quote.IsValid) throw new InvalidOperationException(quote.ErrorMessage);
        payment = new MemberPaymentState { OrderId = $"MBR-{request.HoldToken:N}-{Guid.NewGuid():N}", CouponCode = code, Email = request.Email.Trim(),
            Currency = options.Currency, OriginalAmount = holds.Sum(h => h.Amount), DiscountAmount = quote.DiscountAmount, PreviousAttempts = history };
        payment.Amount = payment.OriginalAmount - payment.DiscountAmount;
        foreach (var hold in holds)
        {
            hold.CustomerName = request.CustomerName.Trim();
            hold.PhoneNumber = request.PhoneNumber.Trim();
        }
        if (payment.Amount == 0) { payment.Status = "paid"; payment.GatewayPaymentId = "COUPON-COVERED"; }
        await SavePayment(holds, payment, ct);
        await transaction.CommitAsync(ct);
        if (payment.Amount == 0)
        {
            var confirmed = await FinalizeVerifiedPayment(request.HoldToken, payment, ct);
            return Ok(new { Confirmation = ((ObjectResult)confirmed).Value });
        }
        return Ok(new { payment.OrderId, options.MerchantId, payment.Currency, Amount = payment.Amount.ToString("0.00", CultureInfo.InvariantCulture), options.Sandbox,
            Hash = hashes.GeneratePayHereHash(options.MerchantId, options.MerchantSecret, payment.OrderId, payment.Amount, payment.Currency), ExpiresInSeconds = Math.Max(0, (int)(holds.Min(h => h.ExpiresAt) - Now).TotalSeconds) });
    });

    [HttpPost("payment/reverse")]
    public Task<IActionResult> ReversePayment([FromBody] MemberReverseRequest request, CancellationToken ct) => Respond(async () =>
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var holds = await HoldsAsync(request.HoldToken, ct);
        await LockCourtAsync(holds[0].CourtId, ct);
        var payment = ReadPayment(holds[0]);
        if (payment is null) return Ok(new { Status = "reversed" });
        if (!string.IsNullOrWhiteSpace(request.OrderId) && payment.OrderId != request.OrderId)
        {
            var previous = payment.PreviousAttempts.SingleOrDefault(p => p.OrderId == request.OrderId);
            if (previous is null) throw new InvalidOperationException("This checkout could not be found.");
            return Ok(new { Status = previous.Status == "paid" ? "review" : "reversed" });
        }
        if (holds.All(h => h.Status == BookingHoldStatus.Confirmed) || payment.Status is "paid" or "review")
            return Ok(new { Status = payment.Status == "review" ? "review" : "paid" });
        payment.Status = "reversed";
        await SavePayment(holds, payment, ct);
        await transaction.CommitAsync(ct);
        return Ok(new { Status = "reversed" });
    });

    [HttpGet("payment-status/{token:guid}")]
    public Task<IActionResult> PaymentStatus(Guid token, CancellationToken ct) => Respond(async () =>
    {
        var holds = await HoldsAsync(token, ct);
        var payment = ReadPayment(holds[0]);
        if (holds.All(h => h.Status == BookingHoldStatus.Confirmed))
        {
            var key = Key(token);
            var bookings = await db.CourtBookings.AsNoTracking().Where(b => b.PaymentId == key).Select(b => new { b.BookingNumber, b.BookingDate, b.BookingAmount }).ToListAsync(ct);
            return Ok(new { Status = "confirmed", Confirmation = new { Succeeded = true, FinalAmount = bookings.Sum(b => b.BookingAmount), Bookings = bookings } });
        }
        if (payment?.Status == "paid")
        {
            try
            {
                var result = await FinalizeVerifiedPayment(token, payment, ct);
                return Ok(new { Status = "confirmed", Confirmation = ((ObjectResult)result).Value });
            }
            catch (InvalidOperationException)
            {
                payment.Status = "review";
                db.ChangeTracker.Clear();
                await SavePayment(await HoldsAsync(token, ct), payment, ct);
            }
        }
        var status = payment?.Status ?? "not_started";
        if (status == "pending" && holds.All(h => h.ExpiresAt <= Now)) status = "expired";
        return Ok(new { Status = status });
    });

    [HttpPost("notify")]
    public async Task<IActionResult> PaymentNotification([FromForm] PaymentNotificationRequest request, CancellationToken ct)
    {
        var options = paymentOptions.Value;
        if (request.MerchantId != options.MerchantId || string.IsNullOrWhiteSpace(options.MerchantSecret) ||
            !request.OrderId.StartsWith("MBR-", StringComparison.Ordinal) || (request.OrderId.Length < 36 || !Guid.TryParseExact(request.OrderId.Substring(4, 32), "N", out var token)))
            return BadRequest();
        await using (var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct))
        {
            var holds = await HoldsAsync(token, ct);
            await LockCourtAsync(holds[0].CourtId, ct);
            var payment = ReadPayment(holds[0]);
            if (payment is null) return BadRequest();
            var attempt = payment.OrderId == request.OrderId ? payment : payment.PreviousAttempts.SingleOrDefault(p => p.OrderId == request.OrderId);
            if (attempt is null || !MemberPaymentSecurity.Verify(request, options, hashes, attempt.OrderId, attempt.Amount, attempt.Currency)) return BadRequest();
            if (attempt != payment)
            {
                if (request.StatusCode == 2 && attempt.Status != "paid")
                {
                    attempt.Status = "paid";
                    attempt.GatewayPaymentId = request.PaymentId;
                    payment.Status = "review";
                    await SavePayment(holds, payment, ct);
                    await transaction.CommitAsync(ct);
                }
                return Ok();
            }
            if (holds.All(h => h.Status == BookingHoldStatus.Confirmed)) return Ok();
            if (payment.Status is not ("paid" or "review"))
            {
                if (request.StatusCode == 2)
                {
                    payment.Status = "paid";
                    payment.GatewayPaymentId = request.PaymentId;
                }
                else if (request.StatusCode is -1 or -2 or -3) payment.Status = "failed";
                else return Ok();
                await SavePayment(holds, payment, ct);
            }
            await transaction.CommitAsync(ct);
        }
        // The persisted, signed result can be finalized idempotently by this callback or the status endpoint.
        await PaymentStatus(token, ct);
        return Ok();
    }

    private async Task<IActionResult> Respond(Func<Task<IActionResult>> action)
    {
        try { return await action(); }
        catch (InvalidOperationException ex) { return BadRequest(new { Message = ex.Message }); }
        catch (ArgumentOutOfRangeException) { return BadRequest(new { Message = "The selected booking period is invalid." }); }
        catch (DbUpdateException) { return Conflict(new { Message = "Your reservation could not be completed. Check availability and try again." }); }
        catch (PostgresException ex) when (ex.SqlState == "40001") { return Conflict(new { Message = "Availability changed while processing. Please try again." }); }
    }
}
