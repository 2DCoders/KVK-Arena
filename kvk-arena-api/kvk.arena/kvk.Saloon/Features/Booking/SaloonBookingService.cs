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
    private readonly kvk.BuildingBlocks.Interfaces.IHolidayService _holidayService;

    public SaloonBookingService(SaloonDbContext db, kvk.BuildingBlocks.Interfaces.IHolidayService holidayService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _holidayService = holidayService ?? throw new ArgumentNullException(nameof(holidayService));
    }

    public async Task<IEnumerable<SaloonBookingResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.SaloonBookings
            .AsNoTracking()
            .Include(b => b.Services)
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

        // Date Validation
        var today = DateOnly.FromDateTime(DateTime.Today);
        if (request.BookingDate < today)
            return Result.Failure("Cannot book in the past");

        var nextWorkingDays = await _holidayService.GetNextWorkingDaysAsync(DateTime.Today, 2, cancellationToken);
        var validDates = new List<DateOnly> { today };
        validDates.AddRange(nextWorkingDays.Select(d => DateOnly.FromDateTime(d)));

        if (!validDates.Contains(request.BookingDate))
            return Result.Failure("Can only book for current day and next two working days (excluding holidays).");

        try
        {
            int totalDurationMinutes = 0;
            int totalBufferMinutes = 0;
            var servicesToAdd = new List<DomainBookingService>();
            var currentTime = request.StartTime;
            
            foreach (var reqService in request.Services)
            {
                var saloonService = await _db.Set<kvk.Saloon.Domain.SaloonService>()
                    .Include(s => s.StaffServices)
                    .FirstOrDefaultAsync(s => s.Id == reqService.SaloonServiceId, cancellationToken);

                if (saloonService == null)
                    return Result.Failure($"Service {reqService.SaloonServiceId} not found");

                totalDurationMinutes += saloonService.DurationMinutes;
                totalBufferMinutes += saloonService.BufferMinutes;
                
                var staffId = saloonService.StaffServices.FirstOrDefault()?.SaloonStaffId;
                if (staffId == null || staffId == Guid.Empty)
                {
                    var anyStaff = await _db.Set<kvk.Saloon.Domain.SaloonStaff>().FirstOrDefaultAsync(cancellationToken);
                    if (anyStaff == null)
                        return Result.Failure("No staff available to assign to this service.");
                    staffId = anyStaff.Id;
                }
                
                var serviceEndTime = currentTime.Add(TimeSpan.FromMinutes(saloonService.DurationMinutes));

                servicesToAdd.Add(new DomainBookingService
                {
                    SaloonServiceId = reqService.SaloonServiceId,
                    SaloonStaffId = staffId.Value,
                    DurationMinutes = saloonService.DurationMinutes,
                    Price = reqService.Price,
                    DiscountAmount = reqService.DiscountAmount,
                    StartTime = currentTime,
                    EndTime = serviceEndTime
                });
                
                currentTime = serviceEndTime;
            }

            var requestedEndTime = request.StartTime.Add(TimeSpan.FromMinutes(totalDurationMinutes));

            var allSaloons = await _db.Set<kvk.Saloon.Domain.Saloon>()
                .Where(s => s.IsActive)
                .Include(s => s.Bookings)
                .ToListAsync(cancellationToken);

            Guid? assignedSaloonId = null;

            foreach (var saloon in allSaloons)
            {
                var overlappingBookings = saloon.Bookings.Where(b => b.BookingDate == request.BookingDate &&
                    b.StartTime < requestedEndTime && b.EndTime > request.StartTime);
                
                if (!overlappingBookings.Any())
                {
                    assignedSaloonId = saloon.Id;
                    break;
                }
            }

            if (!assignedSaloonId.HasValue)
            {
                return Result.Failure("For this start time to this time there is a booking. If convenient, please set the booking after this time.");
            }

            var booking = new DomainBooking
            {
                SaloonId = assignedSaloonId.Value,
                CustomerName = request.CustomerName,
                PhoneNumber = request.PhoneNumber,
                MemberId = request.MemberId,
                BookingDate = request.BookingDate,
                StartTime = request.StartTime,
                EndTime = requestedEndTime,
                Status = request.Status,
                TotalAmount = request.TotalAmount,
                DiscountAmount = request.DiscountAmount,
                Notes = request.Notes,
                PaymentType = request.PaymentType,
                Services = servicesToAdd
            };

            _db.Set<DomainBooking>().Add(booking);
            await _db.SaveChangesAsync(cancellationToken);

            var resultMsg = totalBufferMinutes > 0 
                ? $"Booking created successfully. Note: An additional {totalBufferMinutes} minutes of buffer time may be required."
                : "Booking created successfully.";

            return Result.Success(resultMsg);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create booking: {ex.Message}");
        }
    }

    public async Task<Result> CheckAvailabilityAsync(SaloonBookingAvailabilityRequest request, CancellationToken cancellationToken = default)
    {
        var response = new SaloonBookingAvailabilityResponse();
        
        int totalDurationMinutes = 0;
        foreach (var serviceId in request.SaloonServiceIds)
        {
            var saloonService = await _db.Set<kvk.Saloon.Domain.SaloonService>()
                .FirstOrDefaultAsync(s => s.Id == serviceId, cancellationToken);
            if (saloonService != null)
            {
                totalDurationMinutes += saloonService.DurationMinutes;
            }
        }

        if (totalDurationMinutes == 0)
        {
             return Result.Failure("Invalid services or 0 duration.");
        }
        
        var requestedEndTime = request.Time.Add(TimeSpan.FromMinutes(totalDurationMinutes));
        
        var allSaloons = await _db.Set<kvk.Saloon.Domain.Saloon>()
            .Where(s => s.IsActive)
            .Include(s => s.Bookings)
            .ToListAsync(cancellationToken);

        Guid? assignedSaloonId = null;

        foreach (var saloon in allSaloons)
        {
            var overlappingBookings = saloon.Bookings.Where(b => b.BookingDate == request.Date &&
                b.StartTime < requestedEndTime && b.EndTime > request.Time);
            
            if (!overlappingBookings.Any())
            {
                assignedSaloonId = saloon.Id;
                break;
            }
        }

        if (assignedSaloonId.HasValue)
        {
            response.IsAvailable = true;
            response.AvailableStartTime = request.Time;
            response.AvailableEndTime = requestedEndTime;
            response.AssignedSaloonId = assignedSaloonId.Value;
            response.Message = "Time slot is available.";
            return Result.Success().WithData("Response", response);
        }
        
        // Find rough alternatives
        response.IsAvailable = false;
        response.Message = "This time is not available. Here are some alternative times available roughly for the day.";
        
        // Very basic alternative generation: check +1 hour, +2 hours, -1 hour, -2 hours, etc.
        var candidateTimes = new List<TimeSpan>
        {
            request.Time.Subtract(TimeSpan.FromHours(1)),
            request.Time.Subtract(TimeSpan.FromHours(2)),
            request.Time.Add(TimeSpan.FromHours(1)),
            request.Time.Add(TimeSpan.FromHours(2))
        };
        
        foreach (var ct in candidateTimes)
        {
            if (ct.TotalMinutes < 0 || ct.TotalHours >= 24) continue;
            
            var ctEnd = ct.Add(TimeSpan.FromMinutes(totalDurationMinutes));
            foreach (var saloon in allSaloons)
            {
                var overlappingBookings = saloon.Bookings.Where(b => b.BookingDate == request.Date &&
                    b.StartTime < ctEnd && b.EndTime > ct);
                
                if (!overlappingBookings.Any())
                {
                    if (!response.SuggestedAlternativeTimes.Contains(ct))
                        response.SuggestedAlternativeTimes.Add(ct);
                    break;
                }
            }
        }
        response.SuggestedAlternativeTimes.Sort();
        
        return Result.Success().WithData("Response", response);
    }

    public async Task<Result> UpdateAsync(SaloonBookingUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        // Date Validation
        var today = DateOnly.FromDateTime(DateTime.Today);
        if (request.BookingDate < today)
            return Result.Failure("Cannot book in the past");

        var nextWorkingDays = await _holidayService.GetNextWorkingDaysAsync(DateTime.Today, 2, cancellationToken);
        var validDates = new List<DateOnly> { today };
        validDates.AddRange(nextWorkingDays.Select(d => DateOnly.FromDateTime(d)));

        if (!validDates.Contains(request.BookingDate))
            return Result.Failure("Can only book for current day and next two working days (excluding holidays).");

        try
        {
            var booking = await _db.SaloonBookings
                .Include(b => b.Services)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (booking == null)
                return Result.Failure("Booking not found");

            int totalDurationMinutes = 0;
            int totalBufferMinutes = 0;
            var servicesToAdd = new List<DomainBookingService>();
            var currentTime = request.StartTime;
            
            foreach (var reqService in request.Services)
            {
                var saloonService = await _db.Set<kvk.Saloon.Domain.SaloonService>()
                    .Include(s => s.StaffServices)
                    .FirstOrDefaultAsync(s => s.Id == reqService.SaloonServiceId, cancellationToken);

                if (saloonService == null)
                    return Result.Failure($"Service {reqService.SaloonServiceId} not found");

                totalDurationMinutes += saloonService.DurationMinutes;
                totalBufferMinutes += saloonService.BufferMinutes;
                
                var staffId = saloonService.StaffServices.FirstOrDefault()?.SaloonStaffId;
                if (staffId == null || staffId == Guid.Empty)
                {
                    var anyStaff = await _db.Set<kvk.Saloon.Domain.SaloonStaff>().FirstOrDefaultAsync(cancellationToken);
                    if (anyStaff == null)
                        return Result.Failure("No staff available to assign to this service.");
                    staffId = anyStaff.Id;
                }
                
                var serviceEndTime = currentTime.Add(TimeSpan.FromMinutes(saloonService.DurationMinutes));

                servicesToAdd.Add(new DomainBookingService
                {
                    Id = reqService.Id ?? Guid.Empty,
                    SaloonBookingId = booking.Id,
                    SaloonServiceId = reqService.SaloonServiceId,
                    SaloonStaffId = staffId.Value,
                    DurationMinutes = saloonService.DurationMinutes,
                    Price = reqService.Price,
                    DiscountAmount = reqService.DiscountAmount,
                    StartTime = currentTime,
                    EndTime = serviceEndTime
                });
                
                currentTime = serviceEndTime;
            }

            var requestedEndTime = request.StartTime.Add(TimeSpan.FromMinutes(totalDurationMinutes));

            var allSaloons = await _db.Set<kvk.Saloon.Domain.Saloon>()
                .Where(s => s.IsActive)
                .Include(s => s.Bookings)
                .ToListAsync(cancellationToken);

            Guid? assignedSaloonId = null;

            foreach (var saloon in allSaloons)
            {
                var overlappingBookings = saloon.Bookings.Where(b => b.BookingDate == request.BookingDate && b.Id != booking.Id &&
                    b.StartTime < requestedEndTime && b.EndTime > request.StartTime);
                
                if (!overlappingBookings.Any())
                {
                    assignedSaloonId = saloon.Id;
                    break;
                }
            }

            if (!assignedSaloonId.HasValue)
            {
                return Result.Failure("For this start time to this time there is a booking. If convenient, please set the booking after this time.");
            }

            booking.SaloonId = assignedSaloonId.Value;
            booking.CustomerName = request.CustomerName;
            booking.PhoneNumber = request.PhoneNumber;
            booking.MemberId = request.MemberId;
            booking.BookingDate = request.BookingDate;
            booking.StartTime = request.StartTime;
            booking.EndTime = requestedEndTime;
            booking.Status = request.Status;
            booking.TotalAmount = request.TotalAmount;
            booking.DiscountAmount = request.DiscountAmount;
            booking.Notes = request.Notes;
            booking.PaymentType = request.PaymentType;

            // Update services (simple remove and re-add for simplicity in this example)
            booking.Services.Clear();
            foreach (var s in servicesToAdd)
            {
                if (s.Id == Guid.Empty) s.Id = Guid.NewGuid();
                booking.Services.Add(s);
            }

            await _db.SaveChangesAsync(cancellationToken);

            var resultMsg = totalBufferMinutes > 0 
                ? $"Booking updated successfully. Note: An additional {totalBufferMinutes} minutes of buffer time may be required."
                : "Booking updated successfully.";

            return Result.Success(resultMsg);
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
