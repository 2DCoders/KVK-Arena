using System.Data;
using System.Globalization;
using System.Text.RegularExpressions;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace kvk.Gaming.Features.GamingBooking;

public record GamingWalkInRequest(List<Guid> HoldIds, string CustomerName, string PhoneNumber);
public record GamingWalkInPaymentRequest(PaymentTypes PaymentType);

public partial class GamingBookingService
{
    private const string WalkInPrefix = "walk-in:";
    private static readonly TimeZoneInfo ColomboTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo");
    private static string WalkInReference(Guid id) => $"{WalkInPrefix}{id:N}";
    private static Guid? ParseWalkInId(string? reference) =>
        reference?.StartsWith(WalkInPrefix, StringComparison.Ordinal) == true &&
        Guid.TryParseExact(reference[WalkInPrefix.Length..], "N", out var id) ? id : null;

    public async Task<Result> CreateWalkInAsync(GamingWalkInRequest request, CancellationToken ct)
    {
        if (request.HoldIds is not { Count: > 0 } || request.HoldIds.Distinct().Count() != request.HoldIds.Count)
            return Result.Failure("Select one or more distinct held slots.");
        if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrEmpty(request.PhoneNumber) ||
            !Regex.IsMatch(request.PhoneNumber, @"\A07[0-9]{8}\z"))
            return Result.Failure("Enter a customer name and a valid mobile number.");

        var reference = WalkInReference(request.HoldIds.Min());
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            var holds = await _db.GamingBookingHolds.Include(h => h.AdditionalPurchases)
                .Where(h => request.HoldIds.Contains(h.Id)).ToListAsync(ct);
            if (holds.Count != request.HoldIds.Count)
                return Result.Failure("One or more held slots could not be found.");
            if (holds.All(h => h.Status == GamingBookingHoldStatus.Confirmed && h.PaymentIntentId == reference) &&
                await _db.GamingBookings.CountAsync(b => b.PaymentIntentId == reference, ct) == holds.Count)
                return Result.Success("Walk-in booking already saved.");

            var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ColomboTimeZone));
            if (holds.Any(h => h.BookingDate != today))
                return Result.Failure("Walk-ins can only be booked for today.");
            if (holds.Select(h => h.GamingStationId).Distinct().Count() != 1)
                return Result.Failure("Select slots for one station per walk-in.");
            var now = DateTime.Now;
            var slotIds = holds.Select(h => h.GamingSlotId).Distinct().ToList();
            if (slotIds.Count != holds.Count || holds.Any(h => h.Status != GamingBookingHoldStatus.Pending ||
                h.ExpiresAt <= now || !string.IsNullOrEmpty(h.PaymentIntentId)))
                return Result.Failure("One or more slots are no longer available. Select the slots again.");

            var slots = await _db.GamingSlots.Where(s => slotIds.Contains(s.Id) && s.IsActive &&
                s.GamingStation.IsActive && s.GamingCategory.IsActive).ToDictionaryAsync(s => s.Id, ct);
            if (slots.Count != holds.Count || holds.Any(h => slots[h.GamingSlotId].GamingStationId != h.GamingStationId ||
                slots[h.GamingSlotId].GamingCategoryId != h.GamingCategoryId) ||
                await _db.GamingBookings.AnyAsync(b => b.BookingDate == today && slotIds.Contains(b.GamingSlotId) &&
                    b.Status != GamingBookingStatus.Cancelled, ct))
                return Result.Failure("One or more slots are no longer available.");

            if (holds.SelectMany(h => h.AdditionalPurchases).Any(p => p.Quantity <= 0 || p.UnitPrice < 0))
                return Result.Failure("One or more add-on quantities or prices are invalid.");

            foreach (var hold in holds)
            {
                var purchases = hold.AdditionalPurchases.Select(p => new GamingBookingAdditionalPurchase
                {
                    AdditionalPurchaseId = p.AdditionalPurchaseId, Quantity = p.Quantity, UnitPrice = p.UnitPrice
                }).ToList();
                _db.GamingBookings.Add(new Domain.GamingBooking
                {
                    BookingNumber = GenerateUniqueBookingNumber(),
                    GamingCategoryId = hold.GamingCategoryId, GamingStationId = hold.GamingStationId,
                    GamingSlotId = hold.GamingSlotId, BookingDate = today,
                    CustomerName = request.CustomerName.Trim(), CustomerPhone = request.PhoneNumber,
                    Amount = slots[hold.GamingSlotId].Price + purchases.Sum(p => p.Quantity * p.UnitPrice),
                    Status = GamingBookingStatus.WalkInPendingPayment,
                    PaymentIntentId = reference, AdditionalPurchases = purchases
                });
                hold.Status = GamingBookingHoldStatus.Confirmed;
                hold.PaymentIntentId = reference;
            }
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return Result.Success("Walk-in booking saved. Payment is pending.");
        }
        catch (Exception ex) when (IsWalkInWriteConflict(ex))
        {
            return Result.Failure("The selected slots changed. Refresh and try again.");
        }
    }

    public async Task<Result> PayWalkInAsync(Guid walkInId, PaymentTypes paymentType, CancellationToken ct)
    {
        if (paymentType is not (PaymentTypes.Cash or PaymentTypes.Card))
            return Result.Failure("Select cash or card.");
        var reference = WalkInReference(walkInId);
        List<Domain.GamingBooking> bookings;
        await using (var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct))
        {
            try
            {
                bookings = await _db.GamingBookings.Where(b => b.PaymentIntentId == reference &&
                    b.Status != GamingBookingStatus.Cancelled).ToListAsync(ct);
                if (bookings.Count == 0) return Result.Failure("Walk-in booking could not be found.");
                if (bookings.All(b => b.Status == GamingBookingStatus.Confirmed && b.PaymentType == paymentType))
                    return Result.Success("Walk-in payment already recorded.");
                if (bookings.Any(b => b.Status != GamingBookingStatus.WalkInPendingPayment))
                    return Result.Failure("This walk-in is no longer pending payment.");

                foreach (var booking in bookings)
                {
                    booking.PaymentType = paymentType;
                    booking.Status = GamingBookingStatus.Confirmed;
                }
                await _db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
            }
            catch (Exception ex) when (IsWalkInWriteConflict(ex))
            {
                return Result.Failure("The payment status changed. Refresh before retrying.");
            }
        }

        var amount = bookings.Sum(b => b.Amount);
        var total = amount.ToString(amount == decimal.Truncate(amount) ? "N0" : "N2", CultureInfo.InvariantCulture);
        var method = paymentType == PaymentTypes.Cash ? "cash" : "card";
        var receipt = $"Thanks for playing at KVK Arena Gaming! We received your {method} payment of LKR {total}.";
        const string closing = " See you for another round soon!";
        try
        {
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(20));
            var result = await _smsService.SendSingleMessageAsync(bookings[0].CustomerPhone!,
                receipt.Length + closing.Length <= 150 ? receipt + closing : receipt,
                timeout.Token);
            if (!result.Succeeded) _logger.LogWarning("SMS failed for Gaming walk-in {WalkInId}", walkInId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SMS failed for Gaming walk-in {WalkInId}", walkInId);
        }
        return Result.Success("Walk-in payment recorded.");
    }

    private static bool IsWalkInWriteConflict(Exception exception) =>
        exception.GetBaseException() is PostgresException
        {
            SqlState: PostgresErrorCodes.SerializationFailure or PostgresErrorCodes.DeadlockDetected
        };
}
