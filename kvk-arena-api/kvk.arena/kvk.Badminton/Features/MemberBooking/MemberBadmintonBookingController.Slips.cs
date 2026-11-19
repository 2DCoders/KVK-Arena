using System.Data;
using System.Globalization;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace kvk.Badminton.Features.MemberBooking;

public partial class MemberBadmintonBookingController
{
    private const string ManualPaymentMarker = "PAYMENT-SLIP";
    private const int MaxSlipBytes = 5 * 1024 * 1024;

    private sealed record BankTransferDetails(string BankName, string AccountOwnerName, string AccountNumber, string BranchName);

    private BankTransferDetails? GetBankTransferDetails()
    {
        var bank = configuration.GetSection("MemberBadmintonBooking:BankTransfer");
        var details = new BankTransferDetails(bank["BankName"]?.Trim() ?? "", bank["AccountOwnerName"]?.Trim() ?? "",
            bank["AccountNumber"]?.Trim() ?? "", bank["BranchName"]?.Trim() ?? "");
        return details.BankName.Length > 0 && details.AccountOwnerName.Length > 0 &&
            details.AccountNumber.Length > 0 && details.BranchName.Length > 0 ? details : null;
    }

    [HttpPost("book")]
    public Task<IActionResult> Book([FromBody] MemberConfirmRequest request, CancellationToken ct) => Respond(async () =>
    {
        var trackingUrl = configuration["MemberBadmintonBooking:TrackingUrl"] ?? "https://kvkarena.lk/members/badminton/track";
        MemberSlipReservation reservation;
        await using (var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct))
        {
            var holds = await HoldsAsync(request.HoldToken, ct);
            await LockCourtAsync(holds[0].CourtId, ct);
            var existing = await db.MemberSlipReservations.SingleOrDefaultAsync(r => r.HoldToken == request.HoldToken, ct);
            if (existing is not null)
            {
                reservation = existing;
            }
            else
            {
                EnsureActive(holds);
                if (holds.Any(h => h.PaymentId != null))
                    throw new InvalidOperationException("This reservation already has a payment in progress.");
                await EnsureBookableAsync(holds, ct);
                var prices = holds.Select(h => h.Amount).ToList();
                var slotLimit = DiscountSlotLimit(request.MaximumDiscountableSlots);
                var quote = await coupons.RedeemAsync(request.CouponCode, prices.Take(slotLimit).ToList(), transaction.GetDbTransaction(), ct);
                if (!quote.IsValid) throw new InvalidOperationException(quote.ErrorMessage);
                reservation = new MemberSlipReservation
                {
                    Id = Guid.NewGuid(),
                    HoldToken = request.HoldToken,
                    CustomerName = request.CustomerName.Trim(),
                    PhoneNumber = request.PhoneNumber.Trim(),
                    Email = request.Email.Trim(),
                    MaximumDiscountableSlots = slotLimit,
                    CouponCode = request.CouponCode.Trim().ToUpperInvariant(),
                    FinalAmount = prices.Sum() - quote.DiscountAmount,
                    PaymentDueUtc = DateTime.UtcNow.AddHours(24)
                };
                foreach (var hold in holds)
                {
                    hold.PaymentId = ManualPaymentMarker;
                    hold.ExpiresAt = reservation.FinalAmount == 0 ? DateTime.MaxValue : HoldExpiry(reservation.PaymentDueUtc);
                }
                db.MemberSlipReservations.Add(reservation);
                await db.SaveChangesAsync(ct);
            }
            await transaction.CommitAsync(ct);
        }

        var bank = reservation.FinalAmount > 0 ? GetBankTransferDetails() : null;
        if (!reservation.SmsSent && Status(reservation) is ("awaiting_payment" or "awaiting_approval"))
        {
            var link = $"{trackingUrl.TrimEnd('/')}/{reservation.Id:N}";
            var amount = reservation.FinalAmount.ToString("0.00", CultureInfo.InvariantCulture);
            var instructions = reservation.FinalAmount == 0
                ? "No payment is due. Your booking is awaiting admin approval."
                : $"Pay LKR {amount} within 24 hours and upload your slip for admin approval.";
            var bankInstructions = bank is null ? "" :
                $" Bank: {bank.BankName}, account owner: {bank.AccountOwnerName}, account no.: {bank.AccountNumber}, branch: {bank.BranchName}.";
            try
            {
                var result = await sms.SendSingleMessageAsync(reservation.PhoneNumber,
                    $"KVK Badminton ref {reservation.Id:N}. {instructions}{bankInstructions} Track your booking using your reference: {link}", ct);
                if (result.Succeeded)
                {
                    await db.MemberSlipReservations.Where(r => r.Id == reservation.Id)
                        .ExecuteUpdateAsync(update => update.SetProperty(r => r.SmsSent, true), ct);
                    reservation.SmsSent = true;
                }
                else
                {
                    logger.LogWarning("Booking SMS failed for badminton reference {Reference}", reservation.Id);
                }
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogWarning(ex, "Booking SMS failed for badminton reference {Reference}", reservation.Id);
            }
        }

        return Ok(new { Reference = reservation.Id, reservation.FinalAmount, reservation.PaymentDueUtc, reservation.SmsSent, BankTransfer = bank });
    });

    [HttpGet("track/{reference:guid}")]
    public Task<IActionResult> Track(Guid reference, CancellationToken ct) => Respond(async () =>
    {
        var reservation = await db.MemberSlipReservations.AsNoTracking()
            .Where(r => r.Id == reference)
            .Select(r => new { r.Id, r.FinalAmount, r.PaymentDueUtc, r.Approved, r.Rejected, r.Cancelled, r.RejectionReason, CouponLinked = r.CouponCode != null, HasSlip = r.Slip != null })
            .SingleOrDefaultAsync(ct);
        if (reservation is null) return NotFound(new { Message = "Booking reference could not be found." });
        return Ok(new { Reference = reservation.Id, reservation.FinalAmount, reservation.PaymentDueUtc, reservation.CouponLinked, reservation.RejectionReason,
            BankTransfer = reservation.FinalAmount > 0 ? GetBankTransferDetails() : null,
            Status = SlipStatus(reservation.Approved, reservation.Rejected, reservation.Cancelled, reservation.HasSlip, reservation.FinalAmount, reservation.PaymentDueUtc) });
    });

    [HttpPost("track/{reference:guid}/cancel")]
    public Task<IActionResult> CancelBooking(Guid reference, CancellationToken ct) => Respond(async () =>
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var reservation = await db.MemberSlipReservations.SingleOrDefaultAsync(r => r.Id == reference, ct);
        if (reservation is null) return NotFound(new { Message = "Booking reference could not be found." });
        if (reservation.Approved) return Conflict(new { Message = "Approved bookings cannot be changed." });
        if (reservation.Cancelled) return Ok(new { Status = "cancelled", CouponLinked = reservation.CouponCode != null });

        var holds = await HoldsAsync(reservation.HoldToken, ct);
        await LockCourtAsync(holds[0].CourtId, ct);
        if (!reservation.Rejected && reservation.CouponCode is { } code)
            await coupons.RestoreAsync(code, transaction.GetDbTransaction(), ct);
        foreach (var hold in holds.Where(h => h.Status == BookingHoldStatus.Pending))
            hold.Status = BookingHoldStatus.Released;
        reservation.Cancelled = true;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { Status = "cancelled", CouponLinked = reservation.CouponCode != null });
    });

    [HttpPost("track/{reference:guid}/slip")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxSlipBytes + 65536)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxSlipBytes)]
    public Task<IActionResult> UploadSlip(Guid reference, IFormFile slip, CancellationToken ct) => Respond(async () =>
    {
        if (slip.Length is < 1 or > MaxSlipBytes)
            throw new InvalidOperationException("Upload a PDF, PNG or JPEG file up to 5 MB.");
        using var buffer = new MemoryStream();
        await slip.CopyToAsync(buffer, ct);
        var bytes = buffer.ToArray();
        var contentType = SlipType(bytes);
        if (contentType is null)
            throw new InvalidOperationException("Upload a valid PDF, PNG or JPEG payment slip.");

        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var reservation = await db.MemberSlipReservations.SingleOrDefaultAsync(r => r.Id == reference, ct);
        if (reservation is null) return NotFound(new { Message = "Booking reference could not be found." });
        var status = Status(reservation);
        var replacing = status == "awaiting_approval" && reservation.Slip != null;
        if (!replacing && status is not ("awaiting_payment" or "retry_payment"))
            throw new InvalidOperationException("This booking is no longer accepting payment slips.");
        var holds = await HoldsAsync(reservation.HoldToken, ct);
        await LockCourtAsync(holds[0].CourtId, ct);
        EnsureActive(holds);
        if (!replacing && reservation.PaymentDueUtc <= DateTime.UtcNow)
            throw new InvalidOperationException("The payment deadline has passed.");
        if (reservation.Rejected)
        {
            await EnsureBookableAsync(holds, ct);
            if (reservation.CouponCode is { } code)
            {
                var prices = holds.Select(h => h.Amount).ToList();
                var slotLimit = reservation.MaximumDiscountableSlots ?? GlobalDiscountSlotLimit;
                var quote = await coupons.RedeemAsync(code, prices.Take(slotLimit).ToList(), transaction.GetDbTransaction(), ct);
                if (!quote.IsValid) throw new InvalidOperationException(quote.ErrorMessage);
                if (prices.Sum() - quote.DiscountAmount != reservation.FinalAmount)
                    throw new InvalidOperationException("The original coupon price has changed. Contact KVK Arena with your reference.");
            }
            reservation.Rejected = false;
            reservation.RejectionReason = null;
        }
        reservation.Slip = bytes;
        reservation.SlipRevision = Guid.NewGuid();
        reservation.SlipContentType = contentType;
        foreach (var hold in holds) hold.ExpiresAt = DateTime.MaxValue;
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);
        return Ok(new { Status = "awaiting_approval" });
    });

    [Authorize(Policy = "BadmintonSlipReview")]
    [HttpGet("slip-review")]
    public async Task<IActionResult> SlipReview(CancellationToken ct)
    {
        var reservations = await db.MemberSlipReservations.AsNoTracking()
            .Where(r => !r.Approved && !r.Rejected && !r.Cancelled && (r.Slip != null || r.FinalAmount == 0))
            .OrderBy(r => r.CreatedAt)
            .Select(r => new { Reference = r.Id, r.CustomerName, r.PhoneNumber, r.FinalAmount, r.SlipRevision, HasSlip = r.Slip != null })
            .ToListAsync(ct);
        return Ok(reservations);
    }

    [Authorize(Policy = "BadmintonSlipReview")]
    [HttpGet("slip-review/{reference:guid}/slip")]
    public async Task<IActionResult> DownloadSlip(Guid reference, [FromQuery] Guid? slipRevision, CancellationToken ct)
    {
        var reservation = await db.MemberSlipReservations.AsNoTracking().SingleOrDefaultAsync(r => r.Id == reference, ct);
        if (reservation?.Slip is not { } data) return NotFound();
        if (slipRevision != reservation.SlipRevision)
            return Conflict(new { Message = "The customer replaced this slip. Refresh and download the latest version." });
        var extension = reservation.SlipContentType switch { "application/pdf" => "pdf", "image/png" => "png", _ => "jpg" };
        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return File(data, reservation.SlipContentType ?? "application/octet-stream", $"badminton-{reference:N}.{extension}");
    }

    [Authorize(Policy = "BadmintonSlipReview")]
    [HttpPost("slip-review/{reference:guid}")]
    public Task<IActionResult> ReviewSlip(Guid reference, [FromBody] MemberSlipReviewRequest request, CancellationToken ct) => Respond(async () =>
    {
        var reason = request.Reason?.Trim();
        if (request.Approve == false && string.IsNullOrWhiteSpace(reason))
            return BadRequest(new { Message = "Enter a reason for rejecting the payment slip." });
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        var reservation = await db.MemberSlipReservations.SingleOrDefaultAsync(r => r.Id == reference, ct);
        if (reservation is null) return NotFound(new { Message = "Booking reference could not be found." });
        if (request.Approve == true && reservation.Approved || request.Approve == false && reservation.Rejected)
            return Ok(new { Status = Status(reservation) });
        if (Status(reservation) != "awaiting_approval")
            throw new InvalidOperationException("This booking is no longer awaiting approval.");
        if (request.SlipRevision != reservation.SlipRevision)
            return Conflict(new { Message = "The customer replaced this slip. Refresh and review the latest version." });

        var holds = await HoldsAsync(reservation.HoldToken, ct);
        await LockCourtAsync(holds[0].CourtId, ct);
        EnsureActive(holds);
        if (request.Approve == true)
        {
            await EnsureBookableAsync(holds, ct);
            var prices = holds.Select(h => h.Amount).ToList();
            var amounts = MemberSchedule.Amounts(prices, prices.Sum() - reservation.FinalAmount);
            for (var i = 0; i < holds.Count; i++)
            {
                var hold = holds[i];
                db.CourtBookings.Add(new CourtBooking
                {
                    CourtId = hold.CourtId, CourtSlotId = hold.CourtSlotId, BookingDate = hold.BookingDate,
                    BookingAmount = amounts[i], Status = BookingStatus.Confirmed, CustomerName = reservation.CustomerName,
                    PhoneNumber = reservation.PhoneNumber, PaymentType = PaymentTypes.BankTransfer, PaymentId = Key(reservation.HoldToken),
                    BookingNumber = $"BCKG-{Guid.NewGuid():N}", Notes = $"Member reservation {reservation.Id:N}."
                });
                hold.Status = BookingHoldStatus.Confirmed;
            }
            reservation.Approved = true;
        }
        else
        {
            if (reservation.CouponCode is { } code)
                await coupons.RestoreAsync(code, transaction.GetDbTransaction(), ct);
            reservation.Rejected = true;
            reservation.RejectionReason = reason;
            reservation.Slip = null;
            reservation.SlipRevision = null;
            reservation.SlipContentType = null;
            reservation.PaymentDueUtc = DateTime.UtcNow.AddHours(24);
            foreach (var hold in holds)
            {
                if (reservation.FinalAmount > 0) hold.ExpiresAt = HoldExpiry(reservation.PaymentDueUtc);
                else hold.Status = BookingHoldStatus.Released;
            }
        }
        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        var trackingUrl = configuration["MemberBadmintonBooking:TrackingUrl"] ?? "https://kvkarena.lk/members/badminton/track";
        var link = $"{trackingUrl.TrimEnd('/')}/{reference:N}";
        var message = reservation.Approved
            ? $"KVK Badminton ref {reference:N}: Your booking is approved. Track it at {link}"
            : reservation.FinalAmount > 0
                ? $"KVK Badminton ref {reference:N}: Your payment slip was rejected. Reason: {reservation.RejectionReason}. Upload a replacement within 24 hours at {link}"
                : $"KVK Badminton ref {reference:N}: Your booking was rejected. Reason: {reservation.RejectionReason}. Track it at {link}";
        var smsSent = false;
        try
        {
            smsSent = (await sms.SendSingleMessageAsync(reservation.PhoneNumber, message, CancellationToken.None)).Succeeded;
            if (!smsSent) logger.LogWarning("Review SMS failed for badminton reference {Reference}", reference);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Review SMS failed for badminton reference {Reference}", reference);
        }
        return Ok(new { Status = Status(reservation), SmsSent = smsSent });
    });

    private async Task EnsureBookableAsync(List<BookingHold> holds, CancellationToken ct)
    {
        var court = await db.Courts.AsNoTracking().SingleAsync(c => c.Id == holds[0].CourtId, ct);
        if (court.Status != CourtStatus.Active || holds.Any(h => !h.CourtSlot.IsActive))
            throw new InvalidOperationException("The court or selected sessions are no longer available.");
        var schedule = new ScheduleData(court, holds.Select(h => h.CourtSlot).DistinctBy(s => s.Id).ToList(),
            holds.Select(h => h.BookingDate).Distinct().ToList(), holds.Max(h => h.BookingDate));
        var taken = await TakenSessionsAsync(schedule, ct, holds[0].PaymentIntentId);
        var local = ColomboNow;
        if (holds.Any(h => MemberAvailability.Status(h.BookingDate, h.CourtSlotId, h.CourtSlot.StartTime, local, taken) != "available"))
            throw new InvalidOperationException("One or more sessions have started or are no longer available.");
    }

    // Booking holds store server-local timestamps without a time zone.
    private static DateTime HoldExpiry(DateTime paymentDueUtc) =>
        DateTime.SpecifyKind(paymentDueUtc.ToLocalTime(), DateTimeKind.Unspecified);

    private static string Status(MemberSlipReservation r) =>
        SlipStatus(r.Approved, r.Rejected, r.Cancelled, r.Slip != null, r.FinalAmount, r.PaymentDueUtc);

    private static string SlipStatus(bool approved, bool rejected, bool cancelled, bool hasSlip, decimal amount, DateTime due) =>
        cancelled ? "cancelled"
        : approved ? "approved"
        : rejected && (hasSlip || amount == 0) ? "rejected"
        : !rejected && (hasSlip || amount == 0) ? "awaiting_approval"
        : due <= DateTime.UtcNow ? "expired"
        : rejected ? "retry_payment" : "awaiting_payment";

    private static string? SlipType(ReadOnlySpan<byte> bytes)
    {
        if (bytes.StartsWith("%PDF-"u8)) return "application/pdf";
        if (bytes.StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return "image/png";
        if (bytes.StartsWith(new byte[] { 255, 216, 255 })) return "image/jpeg";
        return null;
    }
}
