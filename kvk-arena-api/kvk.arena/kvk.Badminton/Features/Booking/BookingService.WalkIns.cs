using System.Data;
using System.Globalization;
using System.Text.RegularExpressions;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace kvk.Badminton.Features.Booking;

public partial class BookingService
{
    private static readonly TimeZoneInfo ColomboTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo");

    public async Task<Result> CreateWalkInAsync(WalkInBookingRequest request, CancellationToken ct)
    {
        if (request.HoldIds is not { Count: > 0 } || request.HoldIds.Distinct().Count() != request.HoldIds.Count)
            return Result.Failure("Select one or more distinct held slots.");

        if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrEmpty(request.PhoneNumber) ||
            !Regex.IsMatch(request.PhoneNumber, @"\A07[0-9]{8}\z"))
            return Result.Failure("Enter a customer name and a valid mobile number.");

        var walkInId = request.HoldIds.Min();
        var holdReference = $"walk-in:{walkInId:N}";
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            var holds = await _db.BookingHolds
                .Include(h => h.CourtSlot).ThenInclude(s => s.Court)
                .Where(h => request.HoldIds.Contains(h.Id))
                .ToListAsync(ct);
            if (holds.Count != request.HoldIds.Count)
                return Result.Failure("One or more held slots could not be found.");

            if (holds.All(h => h.Status == BookingHoldStatus.Confirmed && h.PaymentIntentId == holdReference) &&
                await _db.CourtBookings.CountAsync(b => b.WalkInId == walkInId, ct) == holds.Count)
                return Result.Success("Walk-in booking already saved.");

            var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ColomboTimeZone));
            if (holds.Any(h => h.BookingDate != today))
                return Result.Failure("Walk-ins can only be booked for today.");

            var now = DateTime.Now;
            if (holds.Any(h => h.Status != BookingHoldStatus.Pending || h.ExpiresAt <= now ||
                !string.IsNullOrEmpty(h.PaymentIntentId) || !string.IsNullOrEmpty(h.PaymentId) ||
                !h.CourtSlot.IsActive || h.CourtSlot.Court.Status != CourtStatus.Active) ||
                holds.Select(h => h.CourtSlotId).Distinct().Count() != holds.Count)
                return Result.Failure("One or more slots are no longer available. Select the slots again.");

            var slotIds = holds.Select(h => h.CourtSlotId).ToList();
            if (await _db.CourtBookings.AnyAsync(b => b.BookingDate == today &&
                slotIds.Contains(b.CourtSlotId) && b.Status != BookingStatus.Cancelled, ct))
                return Result.Failure("One or more slots have already been booked.");

            foreach (var hold in holds)
            {
                _db.CourtBookings.Add(new CourtBooking
                {
                    CourtId = hold.CourtId,
                    CourtSlotId = hold.CourtSlotId,
                    BookingDate = today,
                    BookingNumber = GenerateUniqueBookingNumber(),
                    BookingAmount = hold.CourtSlot.Price,
                    CustomerName = request.CustomerName.Trim(),
                    PhoneNumber = request.PhoneNumber,
                    Status = BookingStatus.WalkInPendingPayment,
                    WalkInId = walkInId
                });
                hold.Status = BookingHoldStatus.Confirmed;
                hold.PaymentIntentId = holdReference;
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

        List<CourtBooking> bookings;
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            bookings = await _db.CourtBookings.Where(b => b.WalkInId == walkInId).ToListAsync(ct);
            if (bookings.Count == 0)
                return Result.Failure("Walk-in booking could not be found.");

            if (bookings.All(b => b.Status == BookingStatus.Confirmed && b.PaymentType == paymentType))
                return Result.Success("Walk-in payment already recorded.");

            if (bookings.Any(b => b.Status != BookingStatus.WalkInPendingPayment))
                return Result.Failure("This walk-in is no longer pending payment.");

            foreach (var booking in bookings)
            {
                booking.PaymentType = paymentType;
                booking.Status = BookingStatus.Confirmed;
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch (Exception ex) when (IsWalkInWriteConflict(ex))
        {
            return Result.Failure("The payment status changed. Refresh before retrying.");
        }

        var total = bookings.Sum(booking => booking.BookingAmount).ToString("N2", CultureInfo.InvariantCulture);
        var method = paymentType == PaymentTypes.Cash ? "Cash" : "Card";
        await SendBookingSmsAsync(bookings[0].PhoneNumber,
            $"KVK Arena Badminton: Walk-in payment received.\nAmount paid: LKR {total}\nPayment method: {method}\nThank you for playing!");
        return Result.Success("Walk-in payment recorded.");
    }

    private static bool IsWalkInWriteConflict(Exception exception) =>
        exception.GetBaseException() is PostgresException
        {
            SqlState: PostgresErrorCodes.SerializationFailure or PostgresErrorCodes.DeadlockDetected
        };
}
