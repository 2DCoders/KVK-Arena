using System.Data;
using System.Data.Common;
using System.Text.Json;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Constants;
using kvk.BuildingBlocks.Services;
using Microsoft.Extensions.Options;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Npgsql;
using BookingCourt = kvk.Badminton.Domain.Court;

namespace kvk.Badminton.Features.MemberBooking;

// Public coupon-booking flow. Cashier and temporary-booking endpoints remain separate.
[ApiController]
[Route("api/member-badminton-bookings")]
public partial class MemberBadmintonBookingController(BadmintonDbContext db, IReservationCouponService coupons,
    IConfiguration configuration, IHashService hashes, IOptions<PayHereOptions> paymentOptions, ISmsService sms,
    ILogger<MemberBadmintonBookingController> logger) : ControllerBase
{
    private TimeSpan HoldTime => TimeSpan.FromMinutes(Math.Max(1, configuration.GetValue("MemberBadmintonBooking:HoldMinutes", 7)));
    private int GlobalDiscountSlotLimit => Math.Max(0, configuration.GetValue<int>("BadmintonMaxDiscountSlotLimit"));
    private int MaximumDiscountableSlots =>
        Math.Clamp(configuration.GetValue("MemberBadmintonBooking:MaximumDiscountableSlots", GlobalDiscountSlotLimit), 0, GlobalDiscountSlotLimit);
    private static DateTime Now => DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);
    private static DateTime ColomboNow => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo"));
    private static string Key(Guid token) => $"MEMBER:{token:N}";
    private int MaximumWeeks => Math.Clamp(configuration.GetValue("MemberBadmintonBooking:MaximumWeeks", 52), 1, 52);
    private const int CashierMaximumWeeks = 48;

    private void EnsureOfferOpen()
    {
        if (MemberBadmintonOffer.FromConfiguration(configuration).IsExpired(DateTime.UtcNow))
            throw new InvalidOperationException(MemberBadmintonOffer.ExpiredMessage);
    }

    private int DiscountSlotLimit(int? requested) =>
        Math.Clamp(requested ?? MaximumDiscountableSlots, 0, MaximumDiscountableSlots);

    private async Task<BookingCourt> CourtAsync(CancellationToken ct, Guid? courtId = null)
    {
        var configured = courtId ?? configuration.GetValue<Guid?>("MemberBadmintonBooking:CourtId");
        return await db.Courts.AsNoTracking().Where(c => c.Status == CourtStatus.Active && (!configured.HasValue || c.Id == configured))
            .OrderBy(c => c.Name).ThenBy(c => c.Id).FirstOrDefaultAsync(ct)
            ?? throw new InvalidOperationException("The booking court is not available right now.");
    }

    [HttpGet("setup")]
    public Task<IActionResult> Setup(CancellationToken ct) => Respond(async () =>
    {
        if (User.Identity?.IsAuthenticated != true) EnsureOfferOpen();
        var court = await CourtAsync(ct);
        var slots = await db.CourtSlots.AsNoTracking().Where(s => s.CourtId == court.Id && s.IsActive)
            .OrderBy(s => s.StartTime).Select(s => new { SlotId = s.Id, s.CourtId, s.StartTime, s.EndTime, s.Price }).ToListAsync(ct);
        return Ok(new { Court = new { court.Id, court.Name }, Slots = slots, MaximumWeeks, MaximumDiscountableSlots, BankTransfer = GetBankTransferDetails() });
    });

    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpGet("cashier-setup")]
    public Task<IActionResult> CashierSetup(CancellationToken ct) => Respond(async () =>
    {
        var courts = await db.Courts.AsNoTracking().Where(c => c.Status == CourtStatus.Active)
            .OrderBy(c => c.Name).ThenBy(c => c.Id).Select(c => new { c.Id, c.Name }).ToListAsync(ct);
        var courtIds = courts.Select(c => c.Id).ToList();
        var slots = await db.CourtSlots.AsNoTracking().Where(s => courtIds.Contains(s.CourtId) && s.IsActive)
            .OrderBy(s => s.StartTime).Select(s => new { SlotId = s.Id, s.CourtId, s.StartTime, s.EndTime, s.Price }).ToListAsync(ct);
        return Ok(new { Courts = courts, Slots = slots, MaximumWeeks = CashierMaximumWeeks });
    });

    private sealed record ScheduleData(List<CourtSlot> Slots, List<DateOnly> Dates, DateOnly EndDate)
    {
        public decimal Amount => Slots.Sum(s => s.Price) * Dates.Count;
        public List<decimal> Prices => Dates.SelectMany(_ => Slots.Select(s => s.Price)).ToList();
    }
    private bool CanSelectCourt => User.HasClaim("permission", ModuleConstants.BadmintonSpecialBookingsPermission);

    private static bool SelectsCourts(MemberScheduleRequest request) => request.CourtId.HasValue || request.CourtIds is not null;

    private async Task<ScheduleData> ScheduleAsync(MemberScheduleRequest request, CancellationToken ct)
    {
        var maximumWeeks = SelectsCourts(request) ? CashierMaximumWeeks : MaximumWeeks;
        if (request.StartDate == default || request.StartDate < DateOnly.FromDateTime(ColomboNow) || request.Weeks < 1 || request.Weeks > maximumWeeks)
            throw new InvalidOperationException("Choose a valid future start date and duration.");
        if (request.DaysOfWeek is not { Count: > 0 } || request.DaysOfWeek.Any(day => !Enum.IsDefined(day)) || request.DaysOfWeek.Distinct().Count() != request.DaysOfWeek.Count ||
            request.SlotIds is not { Count: > 0 } || request.SlotIds.Distinct().Count() != request.SlotIds.Count)
            throw new InvalidOperationException("Choose valid booking days and time slots.");

        var courtIds = request.CourtIds ?? [(await CourtAsync(ct, request.CourtId)).Id];
        if (courtIds.Count == 0 || courtIds.Distinct().Count() != courtIds.Count ||
            (request.CourtIds is not null && request.CourtId.HasValue) ||
            request.SlotIds.Count > (long)courtIds.Count * 48)
            throw new InvalidOperationException("Choose valid courts and time slots.");
        var slots = await db.CourtSlots.AsNoTracking()
            .Where(s => courtIds.Contains(s.CourtId) && s.Court.Status == CourtStatus.Active && s.IsActive && request.SlotIds.Contains(s.Id))
            .OrderBy(s => s.StartTime).ThenBy(s => s.CourtId).ThenBy(s => s.Id).ToListAsync(ct);
        if (slots.Count != request.SlotIds.Count || slots.Any(s => s.Price < 0) ||
            slots.Select(s => s.CourtId).Distinct().Count() != courtIds.Count)
            throw new InvalidOperationException("One or more selected courts or slots are unavailable.");
        foreach (var courtSlots in slots.GroupBy(s => s.CourtId))
        {
            var ordered = courtSlots.ToList();
            if (ordered.Count > 48 || ordered.Zip(ordered.Skip(1)).Any(pair => pair.First.EndTime != pair.Second.StartTime))
                throw new InvalidOperationException("Choose consecutive time slots without gaps on each court.");
        }
        return new(slots, MemberSchedule.Dates(request.StartDate, request.Weeks, request.DaysOfWeek), MemberSchedule.EndDate(request.StartDate, request.Weeks));
    }

    private async Task<Dictionary<(Guid SlotId, DateOnly Date), string>> TakenSessionsAsync(ScheduleData schedule, CancellationToken ct, string? excludingHoldKey = null)
    {
        var ids = schedule.Slots.Select(s => s.Id).ToList();
        var dates = schedule.Dates;
        var courtBySlot = schedule.Slots.ToDictionary(slot => slot.Id, slot => slot.CourtId);
        var booked = await db.CourtBookings.AsNoTracking().Where(b => ids.Contains(b.CourtSlotId) && dates.Contains(b.BookingDate) && b.Status != BookingStatus.Cancelled)
            .Select(b => new { b.CourtSlotId, b.BookingDate }).ToListAsync(ct);
        var held = await MemberAvailability.ActiveHolds(db.BookingHolds.AsNoTracking(), Now)
            .Where(h => ids.Contains(h.CourtSlotId) && dates.Contains(h.BookingDate) &&
                (excludingHoldKey == null || h.PaymentIntentId != excludingHoldKey))
            .Select(h => new { h.CourtSlotId, h.BookingDate }).ToListAsync(ct);
        var taken = new Dictionary<(Guid SlotId, DateOnly Date), string>();
        foreach (var session in held) taken[(session.CourtSlotId, session.BookingDate)] = "held";
        foreach (var session in booked) taken[(session.CourtSlotId, session.BookingDate)] = "booked";
        // Earlier cashier bookings may still live in the temporary recurring tables.
        var last = schedule.EndDate.ToDateTime(TimeOnly.MaxValue);
        var first = dates.Min().ToDateTime(TimeOnly.MinValue);
        var legacy = await db.CourtBookingTemporarySchedules.AsNoTracking()
            .Where(s => ids.Contains(s.SlotId) &&
                !s.CourtBookingTemporary.IsMigrated && s.CourtBookingTemporary.StartDate <= last &&
                s.CourtBookingTemporary.StartDate.AddDays(s.CourtBookingTemporary.NumberOfSlots * 7) > first)
            .Select(s => new { s.SlotId, s.DayOfWeek, s.CourtBookingTemporary.CourtId, s.CourtBookingTemporary.StartDate, s.CourtBookingTemporary.NumberOfSlots }).ToListAsync(ct);
        foreach (var reservation in legacy)
            foreach (var date in dates)
                if (courtBySlot[reservation.SlotId] == reservation.CourtId && MemberAvailability.BlocksDate(date, DateOnly.FromDateTime(reservation.StartDate), reservation.NumberOfSlots, Enum.Parse<DayOfWeek>(reservation.DayOfWeek.ToString())))
                    taken[(reservation.SlotId, date)] = "booked";
        return taken;
    }

    private async Task<List<object>> ConflictsAsync(ScheduleData schedule, CancellationToken ct)
    {
        var taken = await TakenSessionsAsync(schedule, ct);
        var local = ColomboNow;
        return schedule.Dates.SelectMany(date => schedule.Slots
            .Select(slot => (Slot: slot, Status: MemberAvailability.Status(date, slot.Id, slot.StartTime, local, taken)))
            .Where(session => session.Status != "available")
            .Select(session => (object)new
            {
                Date = date,
                session.Slot.CourtId,
                SlotId = session.Slot.Id,
                SlotName = $"{session.Slot.StartTime:HH:mm} - {session.Slot.EndTime:HH:mm}",
                Message = session.Status switch
                {
                    "booked" => "This session is already booked.",
                    "held" => "This session is temporarily on hold.",
                    _ => "This session has already started."
                }
            })).ToList();
    }

    [HttpPost("check-availability")]
    public Task<IActionResult> CheckAvailability([FromBody] MemberScheduleRequest request, CancellationToken ct) => Respond(async () =>
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            if (SelectsCourts(request)) return Unauthorized();
            EnsureOfferOpen();
        }
        if (SelectsCourts(request) && !CanSelectCourt) return Forbid();
        var schedule = await ScheduleAsync(request, ct);
        var conflicts = await ConflictsAsync(schedule, ct);
        var pricing = SelectsCourts(request) && conflicts.Count == 0
            ? CashierDiscountSettings.Load(configuration).Price(schedule.Prices, DateOnly.FromDateTime(ColomboNow)).Summary : null;
        return Ok(new { IsAvailable = conflicts.Count == 0, OriginalAmount = schedule.Amount, schedule.EndDate,
            BookingCount = schedule.Dates.Count * schedule.Slots.Count, UnavailableSchedules = conflicts, Pricing = pricing });
    });

    private Task LockCourtAsync(Guid courtId, CancellationToken ct) => db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({courtId.ToString()}, 0))", ct);

    private async Task LockCourtsAsync(IEnumerable<Guid> courtIds, CancellationToken ct)
    {
        foreach (var courtId in courtIds.Distinct().Order())
            await LockCourtAsync(courtId, ct);
    }

    private Task<bool> HasInactiveCourtAsync(List<BookingHold> holds, CancellationToken ct)
    {
        var courtIds = holds.Select(h => h.CourtId).Distinct().ToList();
        return db.Courts.AnyAsync(c => courtIds.Contains(c.Id) && c.Status != CourtStatus.Active, ct);
    }

    [HttpPost("hold")]
    public Task<IActionResult> Hold([FromBody] MemberScheduleRequest request, CancellationToken ct) => Respond(async () =>
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            if (SelectsCourts(request)) return Unauthorized();
            EnsureOfferOpen();
        }
        if (SelectsCourts(request) && !CanSelectCourt) return Forbid();
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var schedule = await ScheduleAsync(request, ct);
        await LockCourtsAsync(schedule.Slots.Select(slot => slot.CourtId), ct);
        if ((await ConflictsAsync(schedule, ct)).Count > 0) throw new InvalidOperationException("Some sessions are no longer available. Please check your schedule again.");
        var pricing = SelectsCourts(request)
            ? CashierDiscountSettings.Load(configuration).Price(schedule.Prices, DateOnly.FromDateTime(ColomboNow)).Summary : null;
        var token = Guid.NewGuid();
        var expiry = Now.Add(HoldTime);
        foreach (var date in schedule.Dates)
            foreach (var slot in schedule.Slots)
                db.BookingHolds.Add(new BookingHold { CourtId = slot.CourtId, CourtSlotId = slot.Id, BookingDate = date, Amount = slot.Price, Status = BookingHoldStatus.Pending, ExpiresAt = expiry, PaymentIntentId = Key(token) });
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { HoldToken = token, ExpiresInSeconds = (int)Math.Clamp((expiry - Now).TotalSeconds, 0, int.MaxValue),
            OriginalAmount = schedule.Amount, schedule.EndDate, BookingCount = schedule.Dates.Count * schedule.Slots.Count, Pricing = pricing });
    });

    private async Task<List<BookingHold>> HoldsAsync(Guid token, CancellationToken ct)
    {
        if (token == Guid.Empty) throw new InvalidOperationException("A valid reservation is required.");
        var key = Key(token);
        var holds = await db.BookingHolds.Include(h => h.CourtSlot).Where(h => h.PaymentIntentId == key)
            .OrderBy(h => h.BookingDate).ThenBy(h => h.CourtSlot.StartTime).ThenBy(h => h.CourtId).ThenBy(h => h.CourtSlotId).ToListAsync(ct);
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
        // Cashier clients omit the member page cap and use the global badminton limit.
        var slotLimit = request.MaximumDiscountableSlots is { } requested ? DiscountSlotLimit(requested) : GlobalDiscountSlotLimit;
        var quote = await coupons.QuoteAsync(request.CouponCode, holds.Take(slotLimit).Select(h => h.Amount).ToList(), ct);
        if (!quote.IsValid) return await CouponFailureAsync(request.CouponCode, request.BookingPhoneNumber, quote.ErrorMessage, ct);
        var total = holds.Sum(h => h.Amount);
        return Ok(new { OriginalAmount = total, quote.DiscountAmount, quote.DiscountRate, MaximumDiscountableSlots = slotLimit, FinalAmount = total - quote.DiscountAmount });
    });

    [HttpDelete("hold/{token:guid}")]
    public Task<IActionResult> Release(Guid token, CancellationToken ct) => Respond(async () =>
    {
        var key = Key(token);
        var existing = await db.BookingHolds.AsNoTracking().Where(h => h.PaymentIntentId == key).ToListAsync(ct);
        var payment = ReadPayment(existing.FirstOrDefault());
        if (payment is not null && (payment.Status is "paid" or "review" || payment.Status == "pending" && existing.Any(h => h.ExpiresAt > Now)))
            throw new InvalidOperationException("Please check your payment status before releasing this reservation.");
        await db.BookingHolds.Where(h => h.PaymentIntentId == key && h.Status == BookingHoldStatus.Pending &&
                h.PaymentId != ManualPaymentMarker && h.PaymentId != RejectedSlipCouponHeldMarker && h.PaymentId != CashierSlipMarker)
            .ExecuteUpdateAsync(setters => setters.SetProperty(h => h.Status, BookingHoldStatus.Released), ct);
        return Ok(new { Succeeded = true });
    });

    private async Task<IActionResult> FinalizeVerifiedPayment(Guid token, MemberPaymentState payment, CancellationToken ct)
    {
        if (payment.Status != "paid") throw new InvalidOperationException("Payment has not been verified.");
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var holds = await HoldsAsync(token, ct);
        await LockCourtsAsync(holds.Select(h => h.CourtId), ct);
        var key = Key(token);
        if (holds.All(h => h.Status == BookingHoldStatus.Confirmed))
        {
            var existing = await db.CourtBookings.AsNoTracking().Where(b => b.PaymentId == key).Select(b => new { b.BookingNumber, b.BookingDate, b.BookingAmount }).ToListAsync(ct);
            return Ok(new { Succeeded = true, Bookings = existing, FinalAmount = existing.Sum(b => b.BookingAmount) });
        }
        if (holds.Any(h => h.Status is BookingHoldStatus.Released or BookingHoldStatus.Confirmed))
            throw new InvalidOperationException("The paid reservation needs review. Please contact KVK Arena.");
        if (holds.Any(h => !h.CourtSlot.IsActive) || await HasInactiveCourtAsync(holds, ct))
            throw new InvalidOperationException("The court or selected sessions are no longer available.");
        var settlementSchedule = new ScheduleData(holds.Select(h => h.CourtSlot).DistinctBy(slot => slot.Id).ToList(),
            holds.Select(h => h.BookingDate).Distinct().ToList(), holds.Max(h => h.BookingDate));
        if ((await TakenSessionsAsync(settlementSchedule, ct, key)).Count > 0)
            throw new InvalidOperationException("Some sessions are no longer available. Please contact KVK Arena.");
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

    [Authorize]
    [HttpPost("cashier-availability")]
    public Task<IActionResult> CashierAvailability([FromBody] CashierAvailabilityRequest request, CancellationToken ct) => Respond(async () =>
    {
        if (request.CourtId.HasValue && !CanSelectCourt) return Forbid();
        var court = await CourtAsync(ct, request.CourtId);
        var slots = await db.CourtSlots.AsNoTracking().Where(s => s.CourtId == court.Id && s.IsActive).OrderBy(s => s.StartTime).ToListAsync(ct);
        // Validate the requested window even when the court has no active slots.
        if (request.StartDate == default || request.StartDate < DateOnly.FromDateTime(ColomboNow) || request.Weeks < 1 || request.Weeks > CashierMaximumWeeks ||
            request.DaysOfWeek is not { Count: > 0 } || request.DaysOfWeek.Any(day => !Enum.IsDefined(day)) || request.DaysOfWeek.Distinct().Count() != request.DaysOfWeek.Count)
            throw new InvalidOperationException("Choose a valid start date, duration, and booking day.");
        var dates = MemberSchedule.Dates(request.StartDate, request.Weeks, request.DaysOfWeek);
        var end = MemberSchedule.EndDate(request.StartDate, request.Weeks);
        var schedule = new ScheduleData(slots, dates, end);
        var taken = await TakenSessionsAsync(schedule, ct);
        return Ok(new CashierAvailabilityResponse(request.StartDate, end, request.Weeks, dates,
            MemberAvailability.Slots(dates, slots, ColomboNow, taken)));
    });

    private async Task<CashierPricing> CashierPriceAsync(List<BookingHold> holds, string couponCode, CancellationToken ct,
        DbTransaction? transaction = null)
    {
        var settings = CashierDiscountSettings.Load(configuration);
        var pricing = settings.Price(holds.Select(h => h.Amount).ToList(), DateOnly.FromDateTime(ColomboNow));
        return await ApplyCashierCouponAsync(pricing, couponCode, settings.CouponLimit, ct, transaction);
    }

    private async Task<CashierPricing> ApplyCashierCouponAsync(CashierPricing pricing, string couponCode,
        CashierCouponLimit limit, CancellationToken ct, DbTransaction? transaction = null)
    {
        if (couponCode.Length == 0) return pricing;
        var coupon = transaction is null
            ? await coupons.QuoteAsync(couponCode, pricing.Amounts, ct, limit)
            : await coupons.RedeemAsync(couponCode, pricing.Amounts, transaction, ct, limit);
        if (!coupon.IsValid) throw new InvalidOperationException(coupon.ErrorMessage);
        return pricing.WithCoupon(coupon);
    }

    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpPost("cashier-quote")]
    public Task<IActionResult> CashierQuote([FromBody] CashierPriceRequest request, CancellationToken ct) => Respond(async () =>
    {
        var holds = await HoldsAsync(request.HoldToken, ct);
        EnsureActive(holds);
        var pricing = await CashierPriceAsync(holds, request.CouponCode?.Trim().ToUpperInvariant() ?? "", ct);
        return Ok(pricing.Summary);
    });

    // Staff settlement shares member holds without a gateway.
    [Authorize(Policy = ModuleConstants.BadmintonSpecialBookingsPermission)]
    [HttpPost("cashier-confirm")]
    public Task<IActionResult> CashierConfirm([FromBody] CashierMemberConfirmRequest request, CancellationToken ct) => Respond(async () =>
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) || request.PaymentType is not (1 or 2))
            throw new InvalidOperationException("Enter customer details and select Cash or Card payment.");
        var couponCode = request.CouponCode?.Trim().ToUpperInvariant() ?? "";
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var holds = await HoldsAsync(request.HoldToken, ct);
        await LockCourtsAsync(holds.Select(h => h.CourtId), ct);
        // Reload after the court lock, so simultaneous retries see the committed result.
        foreach (var hold in holds) await db.Entry(hold).ReloadAsync(ct);
        if (holds.Any(h => !string.IsNullOrEmpty(h.PaymentId)))
            throw new InvalidOperationException("This reservation has an online payment. Use its payment status instead.");
        var key = Key(request.HoldToken);
        if (holds.All(h => h.Status == BookingHoldStatus.Confirmed))
        {
            var existing = await db.CourtBookings.AsNoTracking().Where(b => b.PaymentId == key)
                .Select(b => new { b.BookingNumber, b.BookingDate, b.BookingAmount }).ToListAsync(ct);
            return Ok(new { Succeeded = true, Bookings = existing, FinalAmount = existing.Sum(b => b.BookingAmount) });
        }
        EnsureActive(holds);
        if (holds.Any(h => !h.CourtSlot.IsActive) || await HasInactiveCourtAsync(holds, ct))
            throw new InvalidOperationException("The court or selected sessions are no longer available.");
        var settlementSchedule = new ScheduleData(holds.Select(h => h.CourtSlot).DistinctBy(slot => slot.Id).ToList(),
            holds.Select(h => h.BookingDate).Distinct().ToList(), holds.Max(h => h.BookingDate));
        if ((await TakenSessionsAsync(settlementSchedule, ct, key)).Count > 0)
            throw new InvalidOperationException("Some sessions are no longer available. Please check your schedule again.");
        var pricing = await CashierPriceAsync(holds, couponCode, ct, transaction.GetDbTransaction());
        if (!pricing.IsPromotion && couponCode.Length == 0)
            throw new InvalidOperationException("Apply an unredeemed coupon before confirming.");
        if (request.ExpectedAmount is { } expectedAmount && expectedAmount != pricing.FinalAmount)
            throw new InvalidOperationException("The booking price changed. Refresh pricing before confirming.");
        var bookings = new List<CourtBooking>();
        for (var i = 0; i < holds.Count; i++)
        {
            var hold = holds[i];
            var booking = new CourtBooking { CourtId = hold.CourtId, CourtSlotId = hold.CourtSlotId, BookingDate = hold.BookingDate,
                BookingAmount = pricing.Amounts[i], Status = BookingStatus.Confirmed, CustomerName = request.CustomerName.Trim(), PhoneNumber = request.PhoneNumber.Trim(),
                PaymentType = (PaymentTypes)request.PaymentType, PaymentId = key, BookingNumber = $"BCKG-{Guid.NewGuid():N}",
                Notes = $"Cashier settlement.{(couponCode.Length > 0 && i < pricing.CouponSlotCount ? $" Coupon: {couponCode}." : "")}{(pricing.IsPromotion ? " Promotion." : "")}" };
            db.CourtBookings.Add(booking);
            bookings.Add(booking);
            hold.Status = BookingHoldStatus.Confirmed;
            hold.CustomerName = booking.CustomerName;
            hold.PhoneNumber = booking.PhoneNumber;
        }
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { Succeeded = true, pricing.OriginalAmount, DiscountAmount = pricing.PromotionDiscount + pricing.CouponDiscount, pricing.FinalAmount, Pricing = pricing.Summary,
            Bookings = bookings.Select(b => new { b.BookingNumber, b.BookingDate, b.BookingAmount }) });
    });

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
        string.IsNullOrWhiteSpace(hold?.PaymentId) || hold.PaymentId is ManualPaymentMarker or RejectedSlipCouponHeldMarker or CashierSlipMarker
            ? null : JsonSerializer.Deserialize<MemberPaymentState>(hold.PaymentId);
    private async Task SavePayment(List<BookingHold> holds, MemberPaymentState state, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(state);
        foreach (var hold in holds) hold.PaymentId = json;
        await db.SaveChangesAsync(ct);
    }

    [HttpPost("payment")]
    public IActionResult StartPayment() => StatusCode(410, new { Message = "Book your sessions and upload a payment slip." });

    [HttpPost("payment/reverse")]
    public Task<IActionResult> ReversePayment([FromBody] MemberReverseRequest request, CancellationToken ct) => Respond(async () =>
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var holds = await HoldsAsync(request.HoldToken, ct);
        await LockCourtsAsync(holds.Select(h => h.CourtId), ct);
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
            await LockCourtsAsync(holds.Select(h => h.CourtId), ct);
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
