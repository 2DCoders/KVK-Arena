using kvk.BuildingBlocks.Common;
using kvk.Gaming.Enums;
using kvk.Gaming.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Features.GamingBooking;

public class GamingBookingService : IGamingBookingService
{
    private readonly GamingDbContext _db;

    public GamingBookingService(GamingDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateGamingBookingAsync(CreateGamingBookingRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingSlotId == Guid.Empty)
            return Result.Failure("Gaming Slot ID is required.");

        if (string.IsNullOrWhiteSpace(request.CustomerName))
            return Result.Failure("Customer Name is required.");

        if (string.IsNullOrWhiteSpace(request.CustomerPhone))
            return Result.Failure("Customer Phone is required.");

        // Ensure concurrency-safe booking creation to avoid race conditions.
        // Use a transaction for atomicity.
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
            if (gamingStation == null) // Should not happen if Include is correct
                return Result.Failure("Associated Gaming Station not found.");

            if (!gamingStation.IsActive)
                return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive and cannot be booked.");

            var gamingCategory = gamingStation.GamingCategory;
            if (gamingCategory == null) // Should not happen if Include is correct
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
                GamingCategoryId = gamingCategory.Id,
                GamingStationId = gamingStation.Id,
                GamingSlotId = gamingSlot.Id,
                CustomerName = request.CustomerName,
                CustomerPhone = request.CustomerPhone,
                Amount = gamingSlot.Price, // Booking amount must be derived from the Gaming Slot price.
                Status = GamingBookingStatus.Confirmed,
                BookingDate = request.BookingDate
                
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
                LastModifiedAt = booking.LastModifiedAt
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
    
    public async Task<Result> CancelGamingBookingAsync(CancelGamingBookingRequest request, CancellationToken cancellationToken = default)
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

            // Bookings cannot be modified after confirmation; only cancellation is allowed.
            // This is handled by only allowing cancellation and not update operations.

            booking.Status = GamingBookingStatus.Cancelled;
            _db.GamingBookings.Update(booking);

            // Cancelled bookings must release slot availability for future use only if slot is not past time.

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

    public async Task<GamingBookingResponse?> GetGamingBookingByIdAsync(Guid id, CancellationToken cancellationToken = default)
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

    public async Task<List<GamingBookingResponse>> GetGamingBookingsListAsync(GetGamingBookingsListRequest request, CancellationToken cancellationToken = default)
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
            LastModifiedAt = booking.LastModifiedAt
        }).ToList();

        return responses;
    }

    public async Task<List<GamingBookingResponse>> GetBookingsByGamingStationAsync(GetBookingsByGamingStationRequest request, CancellationToken cancellationToken = default)
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
            LastModifiedAt = booking.LastModifiedAt
        }).ToList();

        return responses;
    }

    public async Task<List<GamingBookingResponse>> GetBookingsByCustomerAsync(GetBookingsByCustomerRequest request, CancellationToken cancellationToken = default)
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
            LastModifiedAt = booking.LastModifiedAt
        }).ToList();

        return responses;
    }

    private string GenerateUniqueBookingNumber()
    {
        // Implement a robust unique booking number generation logic.
        // For simplicity, using a timestamp and a random string.
        // In a real-world scenario, consider a more sophisticated approach
        // that guarantees uniqueness and is collision-resistant, possibly
        // involving a sequence generator or a distributed ID system.
        return $"BKG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpperInvariant()}";
    }
}