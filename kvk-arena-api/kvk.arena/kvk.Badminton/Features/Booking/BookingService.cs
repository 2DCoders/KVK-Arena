using System.Data;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;
using Microsoft.EntityFrameworkCore;

namespace kvk.Badminton.Features.Booking;

public class BookingService
{
    private readonly BadmintonDbContext _db;
    private const int DefaultHoldMinutes = 7;

    public BookingService(BadmintonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateHoldAsync(BookingHoldRequest request, CancellationToken ct = default)
    {
        if (request.BookingDate < DateOnly.FromDateTime(DateTime.Now))
            return Result.Failure("Booking date cannot be in the past.");

        try
        {
            // 1. Verify Court and Slot are active
            var slot = await _db.CourtSlots
                .Include(s => s.Court)
                .FirstOrDefaultAsync(s => s.Id == request.CourtSlotId && s.CourtId == request.CourtId, ct);

            if (slot == null || !slot.IsActive || !slot.Court.Status.Equals(CourtStatus.Active))
                return Result.Failure("The selected court or slot is unavailable.");

            // 2. Check Availability (Existing Bookings + Active Holds)
            bool isAvailable = await CheckAvailabilityInternalAsync(request.CourtSlotId, request.BookingDate, ct);
            if (!isAvailable)
                return Result.Failure("The selected slot is already booked or held by another user.");

            // 3. Create Hold
            var hold = new BookingHold
            {
                CourtId = request.CourtId,
                CourtSlotId = request.CourtSlotId,
                BookingDate = request.BookingDate,
                Amount = request.Amount,
                CustomerName = request.CustomerName,
                PhoneNumber = request.PhoneNumber,
                Status = BookingHoldStatus.Pending,
                ExpiresAt = DateTime.Now.AddMinutes(DefaultHoldMinutes)
            };

            _db.Set<BookingHold>().Add(hold);
            await _db.SaveChangesAsync(ct);

            return Result.Success("Slot held successfully.")
                .WithData("response", MapToResponse(hold));
        }
        catch (Exception ex)
        {
            return Result.Failure($"Hold creation failed: {ex.Message}");
        }
    }

    public async Task<Result> ProcessPaymentSuccessAsync(Guid holdId, string paymentIntentId, CancellationToken ct = default)
    {
        // Use Serializable isolation to prevent race conditions during final booking creation
        using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

        try
        {
            var hold = await _db.BookingHolds
                .FirstOrDefaultAsync(h => h.Id == holdId, ct);

            if (hold == null)
                return Result.Failure("Hold not found.");

            // Idempotency: If already confirmed, return success without duplicate work
            if (hold.Status == BookingHoldStatus.Confirmed)
                return Result.Success("Booking already confirmed.");

            if (hold.Status == BookingHoldStatus.Expired || hold.ExpiresAt < DateTime.Now)
            {
                hold.Status = BookingHoldStatus.Expired;
                await _db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
                return Result.Failure("Hold has expired. Payment must be refunded.");
            }

            // Re-validate availability inside the transaction
            bool isStillAvailable = await _db.CourtBookings
                .AnyAsync(b => b.CourtSlotId == hold.CourtSlotId 
                            && b.BookingDate == hold.BookingDate 
                            && b.Status != BookingStatus.Cancelled, ct);

            if (isStillAvailable)
            {
                return Result.Failure("Slot was booked by another confirmed transaction.");
            }

            // Create Final Booking
            var booking = new CourtBooking
            {
                CourtId = hold.CourtId,
                CourtSlotId = hold.CourtSlotId,
                BookingDate = hold.BookingDate,
                BookingAmount = hold.Amount,
                Status = BookingStatus.Confirmed,
                CustomerName = hold.CustomerName,
                PhoneNumber = hold.PhoneNumber,
                // PaymentId = paymentIntentId
            };

            hold.Status = BookingHoldStatus.Confirmed;
            hold.PaymentIntentId = paymentIntentId;

            _db.CourtBookings.Add(booking);
            await _db.SaveChangesAsync(ct);
            
            await transaction.CommitAsync(ct);

            var response = MapToResponse(hold);
            response.BookingId = booking.Id;
            return Result.Success("Booking confirmed.").WithData("response", response);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(ct);
            return Result.Failure("Concurrency conflict: Slot already booked.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            return Result.Failure($"Confirmation failed: {ex.Message}");
        }
    }

    public async Task<Result> CleanupExpiredHoldsAsync(CancellationToken ct = default)
    {
        try
        {
            var expiredHolds = await _db.Set<BookingHold>()
                .Where(h => h.Status == BookingHoldStatus.Pending && h.ExpiresAt < DateTime.UtcNow)
                .ToListAsync(ct);

            foreach (var hold in expiredHolds)
            {
                hold.Status = BookingHoldStatus.Expired;
            }

            int count = await _db.SaveChangesAsync(ct);
            return Result.Success($"Cleaned up {count} expired holds.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Cleanup failed: {ex.Message}");
        }
    }

    private async Task<bool> CheckAvailabilityInternalAsync(Guid slotId, DateOnly date, CancellationToken ct)
    {
        // Check Confirmed Bookings
        var isBooked = await _db.CourtBookings
            .AnyAsync(b => b.CourtSlotId == slotId 
                        && b.BookingDate == date 
                        && b.Status != BookingStatus.Cancelled, ct);

        if (isBooked) return false;

        // Check Active Holds (Pending and not expired)
        var isHeld = await _db.Set<BookingHold>()
            .AnyAsync(h => h.CourtSlotId == slotId 
                        && h.BookingDate == date 
                        && h.Status == BookingHoldStatus.Pending 
                        && h.ExpiresAt > DateTime.Now, ct);

        return !isHeld;
    }

    private BookingResponse MapToResponse(BookingHold hold)
    {
        return new BookingResponse
        {
            HoldId = hold.Id,
            CourtId = hold.CourtId,
            CourtSlotId = hold.CourtSlotId,
            BookingDate = hold.BookingDate,
            Status = hold.Status.ToString(),
            ExpiresAt = hold.ExpiresAt
        };
    }
}