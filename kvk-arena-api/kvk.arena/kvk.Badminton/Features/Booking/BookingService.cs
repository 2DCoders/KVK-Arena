using System.Data;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Interfaces;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kvk.Badminton.Features.Booking;

public class BookingService : IBookingService
{
    private readonly BadmintonDbContext _db;
    private readonly ISmsService _smsService;
    private const int DefaultHoldMinutes = 7;

    public BookingService(BadmintonDbContext db, ISmsService smsService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _smsService = smsService;
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

    public async Task<Result> CreateMultiHoldAsync(MultiBookingRequest request, CancellationToken ct = default)
    {
        if (!request.Bookings.Any())
            return Result.Failure("No bookings provided.");

        var createdHolds = new List<BookingHold>();
        var responses = new List<BookingResponse>();

        // Use a transaction to ensure atomicity for multiple holds
        using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            foreach (var bookingDetail in request.Bookings)
            {
                if (bookingDetail.BookingDate < DateOnly.FromDateTime(DateTime.Now))
                {
                    await transaction.RollbackAsync(ct);
                    return Result.Failure($"Booking date {bookingDetail.BookingDate} cannot be in the past.");
                }

                // 1. Verify Court and Slot are active
                var slot = await _db.CourtSlots
                    .Include(s => s.Court)
                    .FirstOrDefaultAsync(s => s.Id == bookingDetail.CourtSlotId && s.CourtId == bookingDetail.CourtId,
                        ct);

                if (slot == null || !slot.IsActive || !slot.Court.Status.Equals(CourtStatus.Active))
                {
                    await transaction.RollbackAsync(ct);
                    return Result.Failure(
                        $"The selected court or slot for {bookingDetail.CourtId}/{bookingDetail.CourtSlotId} is unavailable.");
                }

                // 2. Check Availability (Existing Bookings + Active Holds)
                bool isAvailable =
                    await CheckAvailabilityInternalAsync(bookingDetail.CourtSlotId, bookingDetail.BookingDate, ct);
                if (!isAvailable)
                {
                    await transaction.RollbackAsync(ct);
                    return Result.Failure(
                        $"The selected slot for {bookingDetail.CourtId}/{bookingDetail.CourtSlotId} is already booked or held by another user.");
                }

                // 3. Create Hold
                var hold = new BookingHold
                {
                    CourtId = bookingDetail.CourtId,
                    CourtSlotId = bookingDetail.CourtSlotId,
                    BookingDate = bookingDetail.BookingDate,
                    Amount = request.TotalAmount / request.Bookings.Count,
                    Status = BookingHoldStatus.Pending,
                    ExpiresAt = DateTime.Now.AddMinutes(DefaultHoldMinutes)
                };

                _db.Set<BookingHold>().Add(hold);
                createdHolds.Add(hold);
            }

            await _db.SaveChangesAsync(ct);

            // No direct payment processing here. Client is expected to handle external payment
            // and then confirm via ProcessPaymentSuccessAsync.

            await transaction.CommitAsync(ct);

            foreach (var hold in createdHolds)
            {
                responses.Add(MapToResponse(hold));
            }

            return Result.Success("Multiple slots held successfully. Awaiting payment confirmation.")
                .WithData("response", responses);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            return Result.Failure($"Multi-hold creation failed: {ex.Message}");
        }
    }

    public async Task<Result> CreateSingleBookingWithPaymentAsync(SingleBookingWithPaymentRequest request,
        CancellationToken ct = default)
    {
        if (request.BookingDate < DateOnly.FromDateTime(DateTime.Now))
            return Result.Failure("Booking date cannot be in the past.");

        using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            // 1. Verify Court and Slot are active
            var slot = await _db.CourtSlots
                .Include(s => s.Court)
                .FirstOrDefaultAsync(s => s.Id == request.CourtSlotId && s.CourtId == request.CourtId, ct);

            if (slot == null || !slot.IsActive || !slot.Court.Status.Equals(CourtStatus.Active))
            {
                await transaction.RollbackAsync(ct);
                return Result.Failure("The selected court or slot is unavailable.");
            }

            // 2. Check Availability (Existing Bookings + Active Holds)
            bool isAvailable = await CheckAvailabilityInternalAsync(request.CourtSlotId, request.BookingDate, ct);
            if (!isAvailable)
            {
                await transaction.RollbackAsync(ct);
                return Result.Failure("The selected slot is already booked or held by another user.");
            }

            // 3. Create Hold
            var hold = new BookingHold
            {
                CourtId = request.CourtId,
                CourtSlotId = request.CourtSlotId,
                BookingDate = request.BookingDate,
                Amount = request.Amount,
                CustomerName = request.CustomerName,
                PhoneNumber = request.PhoneNumber,
                Status = BookingHoldStatus.Pending, // Always pending initially
                ExpiresAt = DateTime.Now.AddMinutes(DefaultHoldMinutes)
            };

            _db.Set<BookingHold>().Add(hold);
            await _db.SaveChangesAsync(ct);

            // For card payments, the client is expected to handle payment externally
            // and then confirm via ProcessPaymentSuccessAsync.
            // For cash payments, the hold is created and can be confirmed manually or via another process.

            await transaction.CommitAsync(ct);

            return Result.Success("Single slot held successfully. Awaiting payment confirmation.")
                .WithData("response", MapToResponse(hold));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            return Result.Failure($"Single hold creation failed: {ex.Message}");
        }
    }

    public async Task<Result> ProcessPaymentSuccessAsync(Guid holdId, CustomerDetails customerDetails,
        string paymentIntentId, CancellationToken ct = default)
    {
        // Use Serializable isolation to prevent race conditions during final booking creation
        using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);

        try
        {
            var hold = await _db.BookingHolds
                .Include(h => h.CourtSlot)
                .Include(h => h.CourtSlot.Court)
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
                CustomerName = customerDetails.CustomerName,
                PhoneNumber = customerDetails.PhoneNumber,
                PaymentId = paymentIntentId,
                PaymentType = customerDetails.PaymentType,
                BookingNumber = GenerateUniqueBookingNumber()
                // Use the paymentIntentId from the hold
            };

            hold.Status = BookingHoldStatus.Confirmed;
            hold.PaymentIntentId = paymentIntentId; // Set PaymentIntentId here upon successful payment confirmation

            _db.CourtBookings.Add(booking);
            await _db.SaveChangesAsync(ct);

            await transaction.CommitAsync(ct);

            // Send SMS
            var courtName = hold.CourtSlot.Court.Name;
            var slotTime = hold.CourtSlot.StartTime.ToString("hh\\:mm") + " - " +
                           hold.CourtSlot.EndTime.ToString("hh\\:mm");
            var message =
                $"Your booking for {courtName} on {hold.BookingDate.ToShortDateString()} at {slotTime} is confirmed. Booking ID: {booking.Id}";
            await _smsService.SendSingleMessageAsync(customerDetails.PhoneNumber, message);

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

    public async Task<Result> ProcessMultiPaymentSuccessAsync(MultiPaymentRequest request,
        CancellationToken ct = default)
    {
        if (!request.HoldIds.Any())
            return Result.Failure("No hold IDs provided for multi-payment processing.");

        using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
        try
        {
            var confirmedBookings = new List<BookingResponse>();
            var courtIds = new List<Guid>();
            var smsMessages = new List<string?>();

            foreach (var holdId in request.HoldIds)
            {
                var hold = await _db.BookingHolds
                    .Include(h => h.CourtSlot)
                    .Include(h => h.CourtSlot.Court)
                    .FirstOrDefaultAsync(h => h.Id == holdId, ct);

                if (hold == null)
                {
                    await transaction.RollbackAsync(ct);
                    return Result.Failure($"Hold with ID {holdId} not found.");
                }

                if (hold.Status == BookingHoldStatus.Confirmed)
                {
                    // Already confirmed, skip and continue
                    var existingBooking = await _db.CourtBookings.FirstOrDefaultAsync(
                        b => b.PaymentId == hold.PaymentIntentId && b.CourtId == hold.CourtId &&
                             b.CourtSlotId == hold.CourtSlotId && b.BookingDate == hold.BookingDate, ct);
                    if (existingBooking != null)
                    {
                        var existingResponse = MapToResponse(hold);
                        existingResponse.BookingId = existingBooking.Id;
                        confirmedBookings.Add(existingResponse);
                        continue;
                    }
                }


                var now = DateTime.Now;
                if (hold.Status == BookingHoldStatus.Expired || hold.ExpiresAt < now)
                {
                    hold.Status = BookingHoldStatus.Expired;
                    await _db.SaveChangesAsync(ct);
                    await transaction.RollbackAsync(ct);
                    return Result.Failure($"Hold with ID {holdId} has expired. Payment must be refunded.");
                }

                // Re-validate availability inside the transaction
                bool isStillAvailable = await _db.CourtBookings
                    .AnyAsync(b => b.CourtSlotId == hold.CourtSlotId
                                   && b.BookingDate == hold.BookingDate
                                   && b.Status != BookingStatus.Cancelled, ct);

                if (isStillAvailable)
                {
                    await transaction.RollbackAsync(ct);
                    return Result.Failure($"Slot for hold ID {holdId} was booked by another confirmed transaction.");
                }

                // Create Final Booking
                var booking = new CourtBooking
                {
                    CourtId = hold.CourtId,
                    CourtSlotId = hold.CourtSlotId,
                    BookingDate = hold.BookingDate,
                    BookingAmount = hold.Amount,
                    Status = BookingStatus.Confirmed,
                    CustomerName = request.CustomerDetails.CustomerName,
                    PhoneNumber = request.CustomerDetails.PhoneNumber,
                    PaymentId = request.PaymentIntentId, 
                    BookingNumber = GenerateUniqueBookingNumber(),
                    PaymentType = request.CustomerDetails.PaymentType
                };

                hold.Status = BookingHoldStatus.Confirmed;
                hold.PaymentIntentId = request.PaymentIntentId;

                courtIds.Add(hold.CourtId);

                _db.CourtBookings.Add(booking);

                var response = MapToResponse(hold);
                response.BookingId = booking.Id;
                confirmedBookings.Add(response);

                var courtName = hold.CourtSlot.Court.Name;
                var slotTime = hold.CourtSlot.StartTime.ToString("hh\\:mm") + " - " +
                               hold.CourtSlot.EndTime.ToString("hh\\:mm");
                smsMessages.Add($"Court: {courtName}, Date: {hold.BookingDate.ToShortDateString()}, Time: {slotTime}");
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            // Send a single consolidated SMS for multiple bookings

            var fullMessage = $"Your bookings are confirmed:\n" + string.Join("\n", smsMessages);
            await _smsService.SendSingleMessageAsync(request.CustomerDetails.PhoneNumber, fullMessage, ct);


            return Result.Success("Multiple bookings confirmed.").WithData("response", confirmedBookings);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(ct);
            return Result.Failure("Concurrency conflict: One or more slots already booked.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(ct);
            return Result.Failure($"Multi-booking confirmation failed: {ex.Message}");
        }
    }

    public async Task VerifyPaymentNotificationAsync(PaymentNotificationRequest request, CancellationToken ct = default)
    {
        Console.WriteLine(
            $"Received payment notification for OrderId: {request.OrderId}, PaymentId: {request.PaymentId}, Status: {request.StatusCode}");

        // Assuming OrderId in the notification corresponds to a BookingHold ID.
        if (Guid.TryParse(request.OrderId, out var holdId))
        {
            using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, ct);
            try
            {
                var hold = await _db.BookingHolds.FirstOrDefaultAsync(h => h.Id == holdId, ct);
                if (hold != null)
                {
                    if (request.StatusCode == 2) // Assuming 2 means success from the payment gateway
                    {
                        // Ensure idempotency: only process if the hold is still pending
                        if (hold.Status == BookingHoldStatus.Pending)
                        {
                            // Re-validate availability inside the transaction
                            bool isStillAvailable = await _db.CourtBookings
                                .AnyAsync(b => b.CourtSlotId == hold.CourtSlotId
                                               && b.BookingDate == hold.BookingDate
                                               && b.Status != BookingStatus.Cancelled, ct);

                            if (isStillAvailable)
                            {
                                Console.WriteLine(
                                    $"Slot for hold {holdId} was booked by another confirmed transaction. Payment notification ignored.");
                                await transaction.RollbackAsync(ct);
                                return;
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
                                PaymentId = request.PaymentId,
                                PaymentType = PaymentTypes.Card,
                                BookingNumber = GenerateUniqueBookingNumber()
                                
                            };

                            hold.Status = BookingHoldStatus.Confirmed;
                            hold.PaymentIntentId = request.PaymentId;

                            _db.CourtBookings.Add(booking);
                            await _db.SaveChangesAsync(ct);
                            await transaction.CommitAsync(ct);
                            Console.WriteLine($"Booking {booking.Id} confirmed via payment notification.");
                        }
                        else
                        {
                            Console.WriteLine(
                                $"Hold {holdId} already in status {hold.Status}, skipping confirmation from notification.");
                            await transaction.CommitAsync(ct); // Commit to release transaction lock
                        }
                    }
                    else
                    {
                        Console.WriteLine(
                            $"Payment notification for hold {holdId} indicates non-success status: {request.StatusCode}");
                        // Optionally update hold status to failed or pending review based on StatusCode
                        // For example:
                        // hold.Status = BookingHoldStatus.PaymentFailed;
                        // await _db.SaveChangesAsync(ct);
                        await transaction.CommitAsync(ct); // Commit to release transaction lock
                    }
                }
                else
                {
                    Console.WriteLine(
                        $"BookingHold with OrderId {request.OrderId} not found for payment notification.");
                    await transaction.RollbackAsync(ct); // Rollback if no hold found
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(ct);
                Console.WriteLine($"Error processing payment notification for OrderId {request.OrderId}: {ex.Message}");
            }
        }
        else
        {
            Console.WriteLine($"Invalid OrderId format in payment notification: {request.OrderId}");
        }
    }

    public async Task<Result> CleanupExpiredHoldsAsync(CancellationToken ct = default)
    {
        try
        {
            var expiredHolds = await _db.Set<BookingHold>()
                .Where(h => h.Status == BookingHoldStatus.Pending && h.ExpiresAt < DateTime.Now)
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
        var now = DateTime.Now;

        // Check Confirmed Bookings
        var isBooked = await _db.CourtBookings
            .AnyAsync(b => b.CourtSlotId == slotId
                           && b.BookingDate == date
                           && b.Status != BookingStatus.Cancelled, ct);

        if (isBooked) return false;

        // Check Active Holds (Pending and not expired)
        var isHeld = await _db.BookingHolds
            .AnyAsync(h => h.CourtSlotId == slotId
                           && h.BookingDate == date
                           && h.Status == BookingHoldStatus.Pending
                           && h.ExpiresAt > now, ct);

        if (isHeld) return false;

        return true;
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
    
    private string GenerateUniqueBookingNumber()
    {
        return $"BCKG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpperInvariant()}";
    }
}