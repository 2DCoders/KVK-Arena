using System.Data;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming.Enums;
using kvk.Gaming.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Features.GamingBooking;

public class GamingBookingService : IGamingBookingService
{
    private readonly GamingDbContext _db;
    private const int DefaultHoldMinutes = 7;

    public GamingBookingService(GamingDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateGamingBookingAsync(CreateGamingBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingSlotId == Guid.Empty)
            return Result.Failure("Gaming Slot ID is required.");

        if (string.IsNullOrWhiteSpace(request.CustomerName))
            return Result.Failure("Customer Name is required.");

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            return Result.Failure("Customer Phone is required.");

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var gamingSlot = await _db.GamingSlots
                .Include(gs => gs.GamingStation)
                .ThenInclude(station => station.GamingCategory)
                .SingleOrDefaultAsync(gs => gs.Id == request.GamingSlotId, cancellationToken);

            if (gamingSlot == null)
                return Result.Failure($"Gaming Slot with ID '{request.GamingSlotId}' not found.");

            if (!gamingSlot.IsActive)
                return Result.Failure($"Gaming Slot is inactive and cannot be booked.");

            if (gamingSlot.IsBooked)
                return Result.Failure($"Gaming Slot is already booked.");

            var gamingStation = gamingSlot.GamingStation;
            if (gamingStation == null)
                return Result.Failure("Associated Gaming Station not found.");

            if (!gamingStation.IsActive)
                return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive and cannot be booked.");

            var gamingCategory = gamingStation.GamingCategory;
            if (gamingCategory == null)
                return Result.Failure("Associated Gaming Category not found.");

            if (request.Amount != gamingSlot.Price)
            {
                return Result.Failure($"Booking amount must match the Gaming Slot price of {gamingSlot.Price:C}.");
            }

            // Mark slot as booked
            gamingSlot.IsBooked = true;
            _db.GamingSlots.Update(gamingSlot);

            // Generate unique booking number
            var bookingNumber = GenerateUniqueBookingNumber();

            var booking = new Domain.GamingBooking
            {
                BookingNumber = bookingNumber,
                GamingCategoryId = gamingCategory.Id, // Use category from slot's station
                GamingStationId = gamingStation.Id, // Use station from slot
                GamingSlotId = gamingSlot.Id,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                Amount = gamingSlot.Price,
                Status = GamingBookingStatus.Confirmed,
                BookingDate = request.BookingDate,
                PaymentType = request.PaymentType
            };

            _db.GamingBookings.Add(booking);
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            var response = new GamingBookingResponse
            {
                Id = booking.Id,
                BookingNumber = booking.BookingNumber,
                GamingCategoryId = booking.GamingCategoryId,
                GamingCategoryName = gamingCategory.Name,
                GamingStationId = booking.GamingStationId,
                GamingStationName = gamingStation.Name,
                GamingSlotId = booking.GamingSlotId,
                SlotDate = request.BookingDate,
                SlotStartTime = gamingSlot.StartTime,
                SlotEndTime = gamingSlot.EndTime,
                CustomerName = booking.CustomerName,
                CustomerPhone = booking.CustomerPhone,
                Amount = booking.Amount,
                Status = booking.Status,
                CreatedAt = booking.CreatedAt,
                LastModifiedAt = booking.LastModifiedAt,
                PaymentType = booking.PaymentType
            };

            return Result.Success("Gaming booking created successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Failed to create gaming booking: {ex.Message}");
        }
    }

    public async Task<Result> CancelGamingBookingAsync(CancelGamingBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.BookingId == Guid.Empty)
            return Result.Failure("Booking ID is required.");

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var booking = await _db.GamingBookings
                .Include(b => b.GamingSlot)
                .SingleOrDefaultAsync(b => b.Id == request.BookingId, cancellationToken);

            if (booking == null)
                return Result.Failure($"Gaming Booking with ID '{request.BookingId}' not found.");

            if (booking.Status == GamingBookingStatus.Cancelled)
                return Result.Success("Gaming booking is already cancelled.");

            booking.Status = GamingBookingStatus.Cancelled;
            _db.GamingBookings.Update(booking);

            // If the slot was marked as booked, unmark it.
            if (booking.GamingSlot != null && booking.GamingSlot.IsBooked)
            {
                booking.GamingSlot.IsBooked = false;
                _db.GamingSlots.Update(booking.GamingSlot);
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Result.Success("Gaming booking cancelled successfully.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Failed to cancel gaming booking: {ex.Message}");
        }
    }

    public async Task<Result> CreateMultiGamingHoldAsync(MultiGamingBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!request.Bookings.Any())
            return Result.Failure("No gaming booking details provided.");

        var createdHolds = new List<GamingBookingHold>();
        var responses = new List<GamingBookingHoldResponse>();

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            foreach (var bookingDetail in request.Bookings)
            {
                if (bookingDetail.BookingDate < DateOnly.FromDateTime(DateTime.Now))
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure($"Booking date {bookingDetail.BookingDate} cannot be in the past.");
                }

                var gamingSlot = await _db.GamingSlots
                    .Include(gs => gs.GamingStation)
                    .ThenInclude(station => station.GamingCategory)
                    .FirstOrDefaultAsync(gs => gs.Id == bookingDetail.GamingSlotId &&
                                               gs.GamingStationId == bookingDetail.GamingStationId &&
                                               gs.GamingCategoryId == bookingDetail.GamingCategoryId,
                        cancellationToken);

                if (gamingSlot == null || !gamingSlot.IsActive || !gamingSlot.GamingStation.IsActive)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure(
                        $"The selected gaming slot, station, or category for {bookingDetail.GamingSlotId} is unavailable or inactive.");
                }

                bool isAvailable = await CheckAvailabilityInternalAsync(bookingDetail.GamingSlotId,
                    bookingDetail.BookingDate, cancellationToken);
                if (!isAvailable)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    return Result.Failure(
                        $"The selected slot for {bookingDetail.GamingSlotId} on {bookingDetail.BookingDate} is already booked or held by another user.");
                }

                var hold = new GamingBookingHold
                {
                    GamingCategoryId = bookingDetail.GamingCategoryId,
                    GamingStationId = bookingDetail.GamingStationId,
                    GamingSlotId = bookingDetail.GamingSlotId,
                    BookingDate = bookingDetail.BookingDate,
                    Amount = request.TotalAmount / request.Bookings.Count, // Distribute total amount
                    CustomerName = request.CustomerName,
                    CustomerPhone = request.CustomerPhone,
                    Status = GamingBookingHoldStatus.Pending,
                    ExpiresAt = DateTime.Now.AddMinutes(DefaultHoldMinutes),
                    
                };

                _db.GamingBookingHolds.Add(hold);
                createdHolds.Add(hold);
            }

            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            foreach (var hold in createdHolds)
            {
                responses.Add(MapToResponse(hold));
            }

            return Result.Success("Multiple gaming slots held successfully. Awaiting payment confirmation.")
                .WithData("response", responses);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Multi-hold creation failed: {ex.Message}");
        }
    }

    public async Task<Result> CreateSingleGamingBookingWithPaymentAsync(SingleGamingBookingWithPaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.BookingDate < DateOnly.FromDateTime(DateTime.Now))
            return Result.Failure("Booking date cannot be in the past.");

        await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var gamingSlot = await _db.GamingSlots
                .Include(gs => gs.GamingStation)
                .ThenInclude(station => station.GamingCategory)
                .FirstOrDefaultAsync(gs => gs.Id == request.GamingSlotId &&
                                           gs.GamingStationId == request.GamingStationId &&
                                           gs.GamingCategoryId == request.GamingCategoryId, cancellationToken);

            if (gamingSlot == null || !gamingSlot.IsActive || !gamingSlot.GamingStation.IsActive)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure("The selected gaming slot, station, or category is unavailable or inactive.");
            }

            bool isAvailable =
                await CheckAvailabilityInternalAsync(request.GamingSlotId, request.BookingDate, cancellationToken);
            if (!isAvailable)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure("The selected slot is already booked or held by another user.");
            }

            var hold = new GamingBookingHold
            {
                GamingCategoryId = request.GamingCategoryId,
                GamingStationId = request.GamingStationId,
                GamingSlotId = request.GamingSlotId,
                BookingDate = request.BookingDate,
                Amount = request.Amount,
                CustomerName = request.CustomerName,
                CustomerPhone = request.PhoneNumber,
                Status = GamingBookingHoldStatus.Pending,
                ExpiresAt = DateTime.Now.AddMinutes(DefaultHoldMinutes)
            };

            _db.GamingBookingHolds.Add(hold);
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Result.Success("Single gaming slot held successfully. Awaiting payment confirmation.")
                .WithData("response", MapToResponse(hold));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Single hold creation failed: {ex.Message}");
        }
    }

    public async Task<Result> ProcessPaymentSuccessAsync(Guid holdId, string paymentIntentId,
        CancellationToken cancellationToken = default)
    {
        await using var transaction =
            await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        try
        {
            var hold = await _db.GamingBookingHolds
                .FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);

            if (hold == null)
                return Result.Failure("Gaming booking hold not found.");

            if (hold.Status == GamingBookingHoldStatus.Confirmed)
                return Result.Success("Gaming booking already confirmed.");

            if (hold.Status == GamingBookingHoldStatus.Expired || hold.ExpiresAt < DateTime.Now)
            {
                hold.Status = GamingBookingHoldStatus.Expired;
                await _db.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);
                return Result.Failure("Gaming booking hold has expired. Payment must be refunded.");
            }

            bool isStillAvailable = await _db.GamingBookings
                .AnyAsync(b => b.GamingSlotId == hold.GamingSlotId
                               && b.BookingDate == hold.BookingDate
                               && b.Status != GamingBookingStatus.Cancelled, cancellationToken);

            if (isStillAvailable)
            {
                return Result.Failure("Gaming slot was booked by another confirmed transaction.");
            }

            var gamingSlot =
                await _db.GamingSlots.FirstOrDefaultAsync(gs => gs.Id == hold.GamingSlotId, cancellationToken);
            if (gamingSlot == null)
            {
                return Result.Failure("Gaming slot associated with the hold not found.");
            }

            gamingSlot.IsBooked = true;
            _db.GamingSlots.Update(gamingSlot);

            var bookingNumber = GenerateUniqueBookingNumber();
            var booking = new Domain.GamingBooking
            {
                BookingNumber = bookingNumber,
                GamingCategoryId = hold.GamingCategoryId,
                GamingStationId = hold.GamingStationId,
                GamingSlotId = hold.GamingSlotId,
                CustomerName = hold.CustomerName,
                CustomerPhone = hold.CustomerPhone,
                Amount = hold.Amount,
                BookingDate = hold.BookingDate,
                Status = GamingBookingStatus.Confirmed,
                PaymentIntentId = paymentIntentId,
                PaymentType = PaymentTypes.Card
            };

            hold.Status = GamingBookingHoldStatus.Confirmed;
            hold.PaymentIntentId = paymentIntentId;

            _db.GamingBookings.Add(booking);
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            var response = MapToResponse(hold);
            response.BookingId = booking.Id;
            return Result.Success("Gaming booking confirmed.").WithData("response", response);
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure("Concurrency conflict: Gaming slot already booked.");
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure($"Confirmation failed: {ex.Message}");
        }
    }

    public async Task VerifyPaymentNotificationAsync(PaymentNotificationRequest request,
        CancellationToken cancellationToken = default)
    {
        // Placeholder for MD5 signature verification.
        // if (!VerifyMd5Signature(request)) {
        //     Console.WriteLine("MD5 signature verification failed for gaming booking.");
        //     return;
        // }

        Console.WriteLine(
            $"Received gaming payment notification for OrderId: {request.OrderId}, PaymentId: {request.PaymentId}, Status: {request.StatusCode}");

        if (Guid.TryParse(request.OrderId, out var holdId))
        {
            await using var transaction =
                await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
            try
            {
                var hold = await _db.GamingBookingHolds.FirstOrDefaultAsync(h => h.Id == holdId, cancellationToken);
                if (hold != null)
                {
                    if (request.StatusCode == 2) // Assuming 2 means success from the payment gateway
                    {
                        if (hold.Status == GamingBookingHoldStatus.Pending)
                        {
                            bool isStillAvailable = await _db.GamingBookings
                                .AnyAsync(b => b.GamingSlotId == hold.GamingSlotId
                                               && b.BookingDate == hold.BookingDate
                                               && b.Status != GamingBookingStatus.Cancelled, cancellationToken);

                            if (isStillAvailable)
                            {
                                Console.WriteLine(
                                    $"Gaming slot for hold {holdId} was booked by another confirmed transaction. Payment notification ignored.");
                                await transaction.RollbackAsync(cancellationToken);
                                return;
                            }

                            var gamingSlot = await _db.GamingSlots.FirstOrDefaultAsync(gs => gs.Id == hold.GamingSlotId,
                                cancellationToken);
                            if (gamingSlot == null)
                            {
                                Console.WriteLine(
                                    $"Gaming slot associated with hold {holdId} not found during notification processing.");
                                await transaction.RollbackAsync(cancellationToken);
                                return;
                            }

                            gamingSlot.IsBooked = true;
                            _db.GamingSlots.Update(gamingSlot);

                            var bookingNumber = GenerateUniqueBookingNumber();
                            var booking = new Domain.GamingBooking
                            {
                                BookingNumber = bookingNumber,
                                GamingCategoryId = hold.GamingCategoryId,
                                GamingStationId = hold.GamingStationId,
                                GamingSlotId = hold.GamingSlotId,
                                CustomerName = hold.CustomerName,
                                CustomerPhone = hold.CustomerPhone,
                                Amount = hold.Amount,
                                BookingDate = hold.BookingDate,
                                Status = GamingBookingStatus.Confirmed,
                                PaymentIntentId = request.PaymentId,
                                PaymentType = PaymentTypes.Card
                            };

                            hold.Status = GamingBookingHoldStatus.Confirmed;
                            hold.PaymentIntentId = request.PaymentId;

                            _db.GamingBookings.Add(booking);
                            await _db.SaveChangesAsync(cancellationToken);
                            await transaction.CommitAsync(cancellationToken);
                            Console.WriteLine($"Gaming booking {booking.Id} confirmed via payment notification.");
                        }
                        else
                        {
                            Console.WriteLine(
                                $"Gaming hold {holdId} already in status {hold.Status}, skipping confirmation from notification.");
                            await transaction.CommitAsync(cancellationToken);
                        }
                    }
                    else
                    {
                        Console.WriteLine(
                            $"Gaming payment notification for hold {holdId} indicates non-success status: {request.StatusCode}");
                        // Optionally update hold status to failed or pending review
                        // hold.Status = GamingBookingHoldStatus.PaymentFailed;
                        // await _db.SaveChangesAsync(cancellationToken);
                        await transaction.CommitAsync(cancellationToken);
                    }
                }
                else
                {
                    Console.WriteLine(
                        $"GamingBookingHold with OrderId {request.OrderId} not found for payment notification.");
                    await transaction.RollbackAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                Console.WriteLine(
                    $"Error processing gaming payment notification for OrderId {request.OrderId}: {ex.Message}");
            }
        }
        else
        {
            Console.WriteLine($"Invalid OrderId format in gaming payment notification: {request.OrderId}");
        }
    }

    public async Task<GamingBookingResponse?> GetGamingBookingByIdAsync(Guid id,
        CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var booking = await _db.GamingBookings
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .AsNoTracking()
            .SingleOrDefaultAsync(b => b.Id == id, cancellationToken);

        if (booking == null)
            return null;

        return new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt
        };
    }

    public async Task<List<GamingBookingResponse>> GetGamingBookingsListAsync(GetGamingBookingsListRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = _db.GamingBookings
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(b => b.BookingNumber.Contains(request.SearchTerm) ||
                                     b.CustomerName.Contains(request.SearchTerm) ||
                                     b.CustomerPhone.Contains(request.SearchTerm));
        }

        if (request.GamingStationId.HasValue && request.GamingStationId != Guid.Empty)
        {
            query = query.Where(b => b.GamingStationId == request.GamingStationId.Value);
        }

        if (request.GamingCategoryId.HasValue && request.GamingCategoryId != Guid.Empty)
        {
            query = query.Where(b => b.GamingCategoryId == request.GamingCategoryId.Value);
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
            .ToListAsync(cancellationToken);

        var responses = bookings.Select(booking => new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt,
            PaymentType = booking.PaymentType
        }).ToList();

        return responses;
    }

    public async Task<List<GamingBookingResponse>> GetBookingsByGamingStationAsync(
        GetBookingsByGamingStationRequest request, CancellationToken cancellationToken = default)
    {
        if (request.GamingStationId == Guid.Empty)
            return new List<GamingBookingResponse>();

        var query = _db.GamingBookings
            .Where(b => b.GamingStationId == request.GamingStationId)
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .AsNoTracking();

        if (request.Date.HasValue)
        {
            query = query.Where(b => b.BookingDate == request.Date.Value);
        }

        var bookings = await query
            .OrderByDescending(b => b.GamingSlot.StartTime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var responses = bookings.Select(booking => new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt,
            PaymentType = booking.PaymentType
        }).ToList();

        return responses;
    }

    public async Task<List<GamingBookingResponse>> GetBookingsByCustomerAsync(GetBookingsByCustomerRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            return new List<GamingBookingResponse>();

        var query = _db.GamingBookings
            .Where(b => b.CustomerPhone == request.CustomerPhone)
            .Include(b => b.GamingSlot)
            .ThenInclude(gs => gs.GamingStation)
            .ThenInclude(station => station.GamingCategory)
            .AsNoTracking();

        if (request.Date.HasValue)
        {
            query = query.Where(b => b.BookingDate == request.Date.Value);
        }

        var bookings = await query
            .OrderByDescending(b => b.GamingSlot.StartTime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var responses = bookings.Select(booking => new GamingBookingResponse
        {
            Id = booking.Id,
            BookingNumber = booking.BookingNumber,
            GamingCategoryId = booking.GamingCategoryId,
            GamingCategoryName = booking.GamingSlot.GamingStation.GamingCategory.Name,
            GamingStationId = booking.GamingStationId,
            GamingStationName = booking.GamingSlot.GamingStation.Name,
            GamingSlotId = booking.GamingSlotId,
            SlotDate = booking.BookingDate,
            SlotStartTime = booking.GamingSlot.StartTime,
            SlotEndTime = booking.GamingSlot.EndTime,
            CustomerName = booking.CustomerName,
            CustomerPhone = booking.CustomerPhone,
            Amount = booking.Amount,
            Status = booking.Status,
            CreatedAt = booking.CreatedAt,
            LastModifiedAt = booking.LastModifiedAt,
            PaymentType = booking.PaymentType
        }).ToList();

        return responses;
    }

    private async Task<bool> CheckAvailabilityInternalAsync(Guid gamingSlotId, DateOnly date, CancellationToken ct)
    {
        var now = DateTime.Now;

        // Check Confirmed Bookings
        var isBooked = await _db.GamingBookings
            .FirstOrDefaultAsync(b => b.GamingSlotId == gamingSlotId
                                      && b.BookingDate == date
                                      && b.Status != GamingBookingStatus.Cancelled, ct);

        var isHeld = await _db.GamingBookingHolds
            .FirstOrDefaultAsync(h => h.GamingSlotId == gamingSlotId
                                      && h.BookingDate == date
                                      && h.Status == GamingBookingHoldStatus.Pending
                                      && h.ExpiresAt > now, ct);
        if (isHeld != null)
        {
            Console.WriteLine($"Returned isHeld.ExpiresAt: {isHeld.ExpiresAt.TimeOfDay}");
            Console.WriteLine($"DateTime.Now at query time: {DateTime.Now}");
        }

        if (isBooked != null || isHeld != null)
        {
            return false;
        }

        return true;
    }

    private GamingBookingHoldResponse MapToResponse(GamingBookingHold hold)
    {
        return new GamingBookingHoldResponse
        {
            HoldId = hold.Id,
            GamingCategoryId = hold.GamingCategoryId,
            GamingStationId = hold.GamingStationId,
            GamingSlotId = hold.GamingSlotId,
            BookingDate = hold.BookingDate,
            Status = hold.Status,
            ExpiresAt = hold.ExpiresAt,
            PaymentIntentId = hold.PaymentIntentId
        };
    }

    private string GenerateUniqueBookingNumber()
    {
        return $"GBKG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpperInvariant()}";
    }
}