using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Constants;
using kvk.BuildingBlocks.Interfaces;
using Kvk.Cafe;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
// For SaloonDbContext
using DomainBooking = kvk.Saloon.Domain.SaloonBooking;
using DomainBookingService = kvk.Saloon.Domain.SaloonBookingService;

namespace kvk.Saloon.Features.Booking;

public class SaloonBookingService : ISaloonBookingService
{
    private readonly SaloonDbContext _db;
    private readonly IHolidayService _holidayService;
    private readonly ISmsService _smsService;
    private readonly ILogger<SaloonBookingService> _logger;

    public SaloonBookingService(SaloonDbContext db, IHolidayService holidayService, ISmsService smsService,
        ILogger<SaloonBookingService> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _holidayService = holidayService ?? throw new ArgumentNullException(nameof(holidayService));
        _smsService = smsService ?? throw new ArgumentNullException(nameof(smsService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    private async Task SendBookingConfirmationSmsAsync(DomainBooking booking, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(booking.PhoneNumber))
            return;

        try
        {
            var message = MessageList.GetSalonBookingConfirmedMessage(
                booking.CustomerName ?? "Customer", booking.BookingDate, booking.StartTime);

            await _smsService.SendSingleMessageAsync(booking.PhoneNumber, message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send salon booking confirmation SMS for booking {BookingId}", booking.Id);
        }
    }

    public async Task<List<SaloonBookingResponse>> GetBookingsListAsync(GetSaloonBookingsListRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.SaloonBookings
            .AsNoTracking()
            .Include(b => b.Saloon)
            .Include(b => b.Services)
            .ThenInclude(s => s.Service)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(b =>
                (b.CustomerName != null && b.CustomerName.Contains(request.SearchTerm)) ||
                (b.PhoneNumber != null && b.PhoneNumber.Contains(request.SearchTerm)));
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
            .OrderBy(b => b.BookingDate).ThenBy(b => b.StartTime)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        return bookings.Select(MapToResponse).ToList();
    }

    public async Task<SaloonBookingResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var booking = await _db.SaloonBookings
                .AsNoTracking()
                .Include(b => b.Saloon)
                .Include(b => b.Services)
                .ThenInclude(s => s.Service)
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
                    b.Status != kvk.Saloon.Domain.SaloonBookingStatus.Cancelled &&
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

            await SendBookingConfirmationSmsAsync(booking, cancellationToken);

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
                b.Status != kvk.Saloon.Domain.SaloonBookingStatus.Cancelled &&
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
                    b.Status != kvk.Saloon.Domain.SaloonBookingStatus.Cancelled &&
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

    // Fallback business hours used only when a seat has no SaloonSlotConfiguration
    // row for the requested day (no admin UI exists yet to manage that table).
    private static readonly TimeSpan DefaultOpenTime = TimeSpan.FromHours(9);
    private static readonly TimeSpan DefaultCloseTime = TimeSpan.FromHours(19);
    private const int DefaultSlotIntervalMinutes = 15;

    public async Task<Result> CheckDayAvailabilityAsync(SaloonDayAvailabilityRequest request, CancellationToken cancellationToken = default)
    {
        if (request.SaloonServiceIds == null || !request.SaloonServiceIds.Any())
            return Result.Failure("At least one service must be selected.");

        var today = DateOnly.FromDateTime(DateTime.Today);
        if (request.Date < today)
            return Result.Failure("Cannot check availability for a past date.");

        var distinctServiceIds = request.SaloonServiceIds.Distinct().ToList();

        var services = await _db.Set<kvk.Saloon.Domain.SaloonService>()
            .Where(s => distinctServiceIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        if (services.Count != distinctServiceIds.Count)
            return Result.Failure("One or more selected services could not be found.");

        var totalDurationMinutes = services.Sum(s => s.DurationMinutes);

        if (totalDurationMinutes <= 0)
            return Result.Failure("Selected services do not have a valid duration.");

        var dayOfWeek = MapDayOfWeek(request.Date.DayOfWeek);

        var allSaloons = await _db.Set<kvk.Saloon.Domain.Saloon>()
            .Where(s => s.IsActive)
            .Include(s => s.Bookings)
            .Include(s => s.SlotConfigurations)
            .ToListAsync(cancellationToken);

        if (allSaloons.Count == 0)
            return Result.Failure("No active seats are configured for booking.");

        var seatWindows = new List<(kvk.Saloon.Domain.Saloon Saloon, TimeSpan Open, TimeSpan Close)>();

        foreach (var saloon in allSaloons)
        {
            var config = saloon.SlotConfigurations
                .Where(c => c.IsActive && c.DayOfWeek == dayOfWeek)
                .OrderBy(c => c.StartTime)
                .FirstOrDefault();

            var open = config?.StartTime ?? DefaultOpenTime;
            var close = config?.EndTime ?? DefaultCloseTime;

            if (close > open)
                seatWindows.Add((saloon, open, close));
        }

        var response = new SaloonDayAvailabilityResponse
        {
            TotalDurationMinutes = totalDurationMinutes,
        };

        if (seatWindows.Count == 0)
        {
            response.Message = "The salon is closed on this date.";
            return Result.Success().WithData("Response", response);
        }

        var globalOpen = seatWindows.Min(w => w.Open);
        var globalClose = seatWindows.Max(w => w.Close);

        var configuredIntervals = allSaloons
            .SelectMany(s => s.SlotConfigurations)
            .Where(c => c.IsActive && c.DayOfWeek == dayOfWeek && c.SlotIntervalMinutes > 0)
            .Select(c => c.SlotIntervalMinutes)
            .ToList();

        var stepMinutes = configuredIntervals.Count > 0 ? configuredIntervals.Min() : DefaultSlotIntervalMinutes;

        var earliestStart = globalOpen;

        if (request.Date == today)
        {
            var now = DateTime.Now.TimeOfDay;
            var roundedNowMinutes = Math.Ceiling(now.TotalMinutes / stepMinutes) * stepMinutes;
            var roundedNow = TimeSpan.FromMinutes(roundedNowMinutes);

            if (roundedNow > earliestStart)
                earliestStart = roundedNow;
        }

        var serviceDuration = TimeSpan.FromMinutes(totalDurationMinutes);
        var stepSpan = TimeSpan.FromMinutes(stepMinutes);
        var availableStarts = new List<TimeSpan>();

        for (var candidate = earliestStart; candidate.Add(serviceDuration) <= globalClose; candidate = candidate.Add(stepSpan))
        {
            var candidateEnd = candidate.Add(serviceDuration);

            var seatFree = seatWindows.Any(w =>
                candidate >= w.Open &&
                candidateEnd <= w.Close &&
                !w.Saloon.Bookings.Any(b =>
                    b.BookingDate == request.Date &&
                    b.Status != kvk.Saloon.Domain.SaloonBookingStatus.Cancelled &&
                    b.StartTime < candidateEnd && b.EndTime > candidate));

            if (seatFree)
                availableStarts.Add(candidate);
        }

        if (availableStarts.Count == 0)
        {
            response.Message = "No available time slots for the selected services on this date.";
            return Result.Success().WithData("Response", response);
        }

        response.IsAvailable = true;
        response.NextAvailableStartTime = availableStarts[0];

        var windows = new List<SaloonAvailableWindow>();
        var windowStart = availableStarts[0];
        var previous = availableStarts[0];

        foreach (var time in availableStarts.Skip(1))
        {
            if ((time - previous) <= stepSpan)
            {
                previous = time;
                continue;
            }

            windows.Add(new SaloonAvailableWindow { From = windowStart, To = previous });
            windowStart = time;
            previous = time;
        }

        windows.Add(new SaloonAvailableWindow { From = windowStart, To = previous });
        response.AvailableWindows = windows;

        var firstWindow = windows[0];
        response.Message = firstWindow.From == firstWindow.To
            ? $"Available at {FormatTime(firstWindow.From)}."
            : $"Available from {FormatTime(firstWindow.From)} onwards.";

        return Result.Success().WithData("Response", response);
    }

    private static string FormatTime(TimeSpan time)
    {
        return DateTime.Today.Add(time).ToString("h:mm tt");
    }

    private static kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek MapDayOfWeek(DayOfWeek dayOfWeek)
    {
        return dayOfWeek switch
        {
            DayOfWeek.Monday => kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek.Monday,
            DayOfWeek.Tuesday => kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek.Tuesday,
            DayOfWeek.Wednesday => kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek.Wednesday,
            DayOfWeek.Thursday => kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek.Thursday,
            DayOfWeek.Friday => kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek.Friday,
            DayOfWeek.Saturday => kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek.Saturday,
            DayOfWeek.Sunday => kvk.Badminton.Features.CourtBookingTemporary.DaysOfWeek.Sunday,
            _ => throw new ArgumentOutOfRangeException(nameof(dayOfWeek)),
        };
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
                    b.Status != kvk.Saloon.Domain.SaloonBookingStatus.Cancelled &&
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
            SaloonName = booking.Saloon?.Name,
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
                ServiceName = s.Service?.Name,
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
