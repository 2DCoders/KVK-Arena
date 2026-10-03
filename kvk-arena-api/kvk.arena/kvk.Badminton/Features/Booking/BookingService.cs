using System.Data;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Interfaces;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using kvk.BuildingBlocks.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace kvk.Badminton.Features.Booking;

public class BookingService : IBookingService
{
    private readonly BadmintonDbContext _db;
    private readonly ISmsService _smsService;
    private const int DefaultHoldMinutes = 7;
    private readonly IHashService _hashService;
    private readonly PayHereOptions _payHereOptions;
    private readonly ILogger<BookingService> _logger;

    public BookingService(
        BadmintonDbContext db, 
        ISmsService smsService,
        IHashService hashService, 
        IOptions<PayHereOptions> payHereOptions,
        ILogger<BookingService> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _smsService = smsService;
        _hashService = hashService ?? throw new ArgumentNullException(nameof(hashService));
        _payHereOptions = payHereOptions?.Value ?? throw new ArgumentNullException(nameof(payHereOptions));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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

            // Generate a PayHere order id + hash for this hold so the client can launch checkout.
            // The webhook (VerifyPaymentNotificationAsync) matches back to this hold via PaymentIntentId.
            var orderId = $"BDM-PAY-{DateTime.Now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
            hold.PaymentIntentId = orderId;
            await _db.SaveChangesAsync(ct);

            await transaction.CommitAsync(ct);

            var hash = _hashService.GeneratePayHereHash(
                _payHereOptions.MerchantId, _payHereOptions.MerchantSecret, orderId, request.Amount,
                _payHereOptions.Currency);

            var response = MapToResponse(hold);
            response.MerchantId = _payHereOptions.MerchantId;
            response.OrderId = orderId;
            response.Currency = _payHereOptions.Currency;
            response.Amount = request.Amount.ToString("0.00");
            response.Hash = hash;

            return Result.Success("Single slot held successfully. Awaiting payment confirmation.")
                .WithData("response", response);
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


            var confirmMessage = confirmedBookings.Count == 1
                ? "Booking confirmed."
                : "Multiple bookings confirmed.";

            return Result.Success(confirmMessage).WithData("response", confirmedBookings);
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

    public async Task<Result> CreateMultiPaymentAsync(MultiBookingPaymentRequest request, CancellationToken ct = default)
    {
        if (request.HoldIds == null || request.HoldIds.Count == 0)
            return Result.Failure("At least one hold id is required.");

        var holds = await _db.BookingHolds
            .Where(h => request.HoldIds.Contains(h.Id))
            .ToListAsync(ct);

        if (holds.Count != request.HoldIds.Count)
            return Result.Failure("One or more holds were not found.");

        if (holds.Any(h => h.Status != BookingHoldStatus.Pending || h.ExpiresAt < DateTime.Now))
            return Result.Failure("One or more holds have expired. Please select the slots again.");

        var orderId = $"BDM-MPAY-{DateTime.Now:yyyyMMddHHmmss}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var totalAmount = holds.Sum(h => h.Amount);

        foreach (var hold in holds)
        {
            hold.PaymentIntentId = orderId;
            hold.CustomerName = request.CustomerName;
            hold.PhoneNumber = request.PhoneNumber;
        }

        await _db.SaveChangesAsync(ct);

        var hash = _hashService.GeneratePayHereHash(
            _payHereOptions.MerchantId, _payHereOptions.MerchantSecret, orderId, totalAmount,
            _payHereOptions.Currency);

        return Result.Success("Payment initiated.").WithData("response", new BookingPaymentResponse
        {
            MerchantId = _payHereOptions.MerchantId,
            OrderId = orderId,
            Currency = _payHereOptions.Currency,
            Amount = totalAmount.ToString("0.00"),
            Hash = hash
        });
    }

    public async Task VerifyPaymentNotificationAsync(PaymentNotificationRequest request, CancellationToken ct = default)
    {
        var holds = await _db.BookingHolds
            .Where(h => h.PaymentIntentId == request.OrderId && h.Status == BookingHoldStatus.Pending)
            .ToListAsync(ct);

        if (holds.Count == 0)
        {
            _logger.LogWarning("Pending booking hold(s) with order id {OrderId} were not found.", request.OrderId);
            return;
        }

        var expectedMd5Sig =
            _hashService.GenerateNotificationMd5Sig(
                request.MerchantId,
                _payHereOptions.MerchantSecret,
                request.OrderId,
                request.PayhereAmount,
                request.PayhereCurrency,
                request.StatusCode);

        _logger.LogInformation("Expected MD5 Signature: {ExpectedMd5Sig}, Received MD5 Signature: {ReceivedMd5Sig}",
            expectedMd5Sig, request.Md5Sig);

        if (!string.Equals(
                expectedMd5Sig,
                request.Md5Sig,
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (request.StatusCode != 2)
            return;

        var totalAmount = holds.Sum(h => h.Amount);
        if (totalAmount != request.PayhereAmount)
            return;

        var first = holds[0];

        // Reuses the existing, tested multi-hold confirmation logic (idempotent per hold, sends SMS).
        // Works uniformly whether this order id covers one hold or several.
        await ProcessMultiPaymentSuccessAsync(new MultiPaymentRequest
        {
            HoldIds = holds.Select(h => h.Id).ToList(),
            CustomerDetails = new CustomerDetails
            {
                CustomerName = first.CustomerName,
                PhoneNumber = first.PhoneNumber,
                PaymentType = PaymentTypes.Card
            },
            PaymentIntentId = request.PaymentId
        }, ct);
    }

    public async Task<Result> DeletePendingPayment(BadmintonPendingPaymentDeleteRequest request, CancellationToken ct = default)
    {
        var holds = await _db.BookingHolds
            .Where(h => h.PaymentIntentId == request.OrderId && h.Status == BookingHoldStatus.Pending)
            .ToListAsync(ct);

        if (holds.Count == 0)
            return Result.Failure($"Pending payment with order id {request.OrderId} was not found.");

        foreach (var hold in holds)
            hold.Status = BookingHoldStatus.Expired;

        await _db.SaveChangesAsync(ct);

        return Result.Success("Pending payment reversed successfully");
    }

    public async Task<Result> CleanupExpiredHoldsAsync(CancellationToken ct = default)
    {
        try
        {
            // ExpiresAt is "timestamp without time zone"; DateTime.Now (Kind=Local) used as
            // a query parameter against it can get silently shifted by the server's UTC
            // offset. Normalize to Unspecified so it compares as the plain naive value.
            var nowUnspecified = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

            var expiredHolds = await _db.Set<BookingHold>()
                .Where(h => h.Status == BookingHoldStatus.Pending && h.ExpiresAt < nowUnspecified)
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

    public async Task<List<BookingListResponse>> GetBookingsListAsync(GetBookingsListRequest request,
        CancellationToken ct = default)
    {
        var query = _db.CourtBookings
            .Include(b => b.Court)
            .Include(b => b.CourtSlot)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(b => b.BookingNumber.Contains(request.SearchTerm) ||
                                      b.CustomerName.Contains(request.SearchTerm) ||
                                      b.PhoneNumber.Contains(request.SearchTerm));
        }

        if (request.CourtId.HasValue && request.CourtId != Guid.Empty)
        {
            query = query.Where(b => b.CourtId == request.CourtId.Value);
        }

        if (request.Status.HasValue)
        {
            query = query.Where(b => b.Status == request.Status.Value);
        }

        if (request.FromDate.HasValue)
        {
            query = query.Where(b => b.BookingDate >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            query = query.Where(b => b.BookingDate <= request.ToDate.Value);
        }

        var bookings = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(ct);

        return bookings.Select(booking => new BookingListResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            CourtId = booking.CourtId,
            CourtName = booking.Court.Name,
            CourtSlotId = booking.CourtSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.CourtSlot.StartTime,
            SlotEndTime = booking.CourtSlot.EndTime,
            CustomerName = booking.CustomerName,
            PhoneNumber = booking.PhoneNumber,
            BookingAmount = booking.BookingAmount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            PaymentType = booking.PaymentType,
            Notes = booking.Notes
        }).ToList();
    }

    public async Task<Result> FixStalePendingBookingsAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Now);

        var stalePendingBookings = await _db.CourtBookings
            .Where(b => b.Status == BookingStatus.Pending && b.BookingDate >= today)
            .ToListAsync(ct);

        foreach (var booking in stalePendingBookings)
        {
            booking.Status = BookingStatus.Confirmed;
        }

        await _db.SaveChangesAsync(ct);

        return Result.Success($"Updated {stalePendingBookings.Count} booking(s) from Pending to Confirmed.");
    }

    private async Task<bool> CheckAvailabilityInternalAsync(Guid slotId, DateOnly date, CancellationToken ct)
    {
        // ExpiresAt is "timestamp without time zone"; DateTime.Now (Kind=Local) used as
        // a query parameter against it can get silently shifted by the server's UTC
        // offset. Normalize to Unspecified so it compares as the plain naive value.
        var now = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

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