using kvk.BuildingBlocks.Common;
using Kvk.Cafe;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
// For SaloonDbContext
using DomainBooking = kvk.Saloon.Domain.SaloonBooking;
using DomainBookingService = kvk.Saloon.Domain.SaloonBookingService;

namespace kvk.Saloon.Features.Booking;

public class SaloonBookingService : ISaloonBookingService
{
    private readonly SaloonDbContext _db;

    public SaloonBookingService(SaloonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<SaloonBookingResponse>> GetAllAsync(Guid saloonId, CancellationToken cancellationToken = default)
    {
        return await _db.SaloonBookings
            .AsNoTracking()
            .Include(b => b.Services)
            .Where(b => b.SaloonId == saloonId)
            .OrderByDescending(b => b.BookingDate).ThenBy(b => b.StartTime)
            .Select(b => MapToResponse(b))
            .ToListAsync(cancellationToken);
    }

    public async Task<SaloonBookingResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var booking = await _db.SaloonBookings
                .AsNoTracking()
                .Include(b => b.Services)
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (booking == null)
                throw new KeyNotFoundException("Booking not found");

            return MapToResponse(booking);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get booking: {ex.Message}");
        }
    }

    public async Task<Result> CreateAsync(SaloonBookingCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.SaloonId == Guid.Empty)
            return Result.Failure("Saloon ID is required");

        if (request.EndTime <= request.StartTime)
            return Result.Failure("End time must be after start time");

        try
        {
            var booking = new DomainBooking
            {
                SaloonId = request.SaloonId,
                CustomerName = request.CustomerName,
                PhoneNumber = request.PhoneNumber,
                MemberId = request.MemberId,
                BookingDate = request.BookingDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                Status = request.Status,
                TotalAmount = request.TotalAmount,
                DiscountAmount = request.DiscountAmount,
                Notes = request.Notes,
                PaymentType = request.PaymentType,
            };

            if (request.Services != null)
            {
                foreach (var s in request.Services)
                {
                    booking.Services.Add(new DomainBookingService
                    {
                        SaloonServiceId = s.SaloonServiceId,
                        SaloonStaffId = s.SaloonStaffId,
                        DurationMinutes = s.DurationMinutes,
                        Price = s.Price,
                        DiscountAmount = s.DiscountAmount,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime
                    });
                }
            }

            _db.Set<DomainBooking>().Add(booking);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Booking created successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create booking: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(SaloonBookingUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.EndTime <= request.StartTime)
            return Result.Failure("End time must be after start time");

        try
        {
            var booking = await _db.SaloonBookings
                .Include(b => b.Services)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (booking == null)
                return Result.Failure("Booking not found");

            booking.CustomerName = request.CustomerName;
            booking.PhoneNumber = request.PhoneNumber;
            booking.MemberId = request.MemberId;
            booking.BookingDate = request.BookingDate;
            booking.StartTime = request.StartTime;
            booking.EndTime = request.EndTime;
            booking.Status = request.Status;
            booking.TotalAmount = request.TotalAmount;
            booking.DiscountAmount = request.DiscountAmount;
            booking.Notes = request.Notes;
            booking.PaymentType = request.PaymentType;

            // Update services (simple remove and re-add for simplicity in this example)
            booking.Services.Clear();
            if (request.Services != null)
            {
                foreach (var s in request.Services)
                {
                    booking.Services.Add(new DomainBookingService
                    {
                        SaloonServiceId = s.SaloonServiceId,
                        SaloonStaffId = s.SaloonStaffId,
                        DurationMinutes = s.DurationMinutes,
                        Price = s.Price,
                        DiscountAmount = s.DiscountAmount,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime
                    });
                }
            }

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Booking updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update booking: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var booking = await _db.Set<DomainBooking>()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (booking == null)
                return Result.Failure("Booking not found");

            _db.Set<DomainBooking>().Remove(booking);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Booking deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete booking: {ex.Message}");
        }
    }

    private static SaloonBookingResponse MapToResponse(DomainBooking booking)
    {
        return new SaloonBookingResponse
        {
            Id = booking.Id,
            SaloonId = booking.SaloonId,
            CustomerName = booking.CustomerName,
            PhoneNumber = booking.PhoneNumber,
            MemberId = booking.MemberId,
            BookingDate = booking.BookingDate,
            StartTime = booking.StartTime,
            EndTime = booking.EndTime,
            Status = booking.Status,
            TotalAmount = booking.TotalAmount,
            DiscountAmount = booking.DiscountAmount,
            Notes = booking.Notes,
            PaymentType = booking.PaymentType,
            Services = booking.Services?.Select(s => new SaloonBookingServiceResponse
            {
                Id = s.Id,
                SaloonBookingId = s.SaloonBookingId,
                SaloonServiceId = s.SaloonServiceId,
                SaloonStaffId = s.SaloonStaffId,
                DurationMinutes = s.DurationMinutes,
                Price = s.Price,
                DiscountAmount = s.DiscountAmount,
                StartTime = s.StartTime,
                EndTime = s.EndTime
            }).ToList() ?? new List<SaloonBookingServiceResponse>()
        };
    }
}
