using kvk.Saloon.Domain;
using kvk.Saloon.Features.Booking;
using kvk.Saloon.Interfaces;

namespace kvk.Saloon.Features.Dashboard;

public class SaloonDashboardService : ISaloonDashboardService
{
    private const int MonthlyRevenueMonths = 6;
    private const int DailyRevenueDays = 14;
    private const int UpcomingHoursCount = 6;
    private const int BookingFetchPageSize = 10000;
    private static readonly int OpenHour = 9;
    private static readonly int CloseHour = 19;

    private readonly ISaloonService _saloonService;
    private readonly ISaloonStaffService _staffService;
    private readonly ISaloonServiceItemService _serviceItemService;
    private readonly ISaloonBookingService _bookingService;

    public SaloonDashboardService(ISaloonService saloonService, ISaloonStaffService staffService,
        ISaloonServiceItemService serviceItemService, ISaloonBookingService bookingService)
    {
        _saloonService = saloonService ?? throw new ArgumentNullException(nameof(saloonService));
        _staffService = staffService ?? throw new ArgumentNullException(nameof(staffService));
        _serviceItemService = serviceItemService ?? throw new ArgumentNullException(nameof(serviceItemService));
        _bookingService = bookingService ?? throw new ArgumentNullException(nameof(bookingService));
    }

    public async Task<SaloonDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var seats = (await _saloonService.GetAllAsync(cancellationToken)).ToList();
        var activeSeats = seats.Where(s => s.IsActive).ToList();
        var staff = (await _staffService.GetAllAsync(cancellationToken)).ToList();
        var services = (await _serviceItemService.GetAllAsync(cancellationToken)).ToList();

        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);

        var rangeStart = DateOnly.FromDateTime(new DateTime(now.Year, now.Month, 1).AddMonths(-(MonthlyRevenueMonths - 1)));
        var bookings = await _bookingService.GetBookingsListAsync(new GetSaloonBookingsListRequest
        {
            FromDate = rangeStart,
            ToDate = today,
            PageNumber = 1,
            PageSize = BookingFetchPageSize
        }, cancellationToken);

        var paidBookings = bookings
            .Where(b => b.Status == SaloonBookingStatus.Confirmed ||
                        b.Status == SaloonBookingStatus.InProgress ||
                        b.Status == SaloonBookingStatus.Completed)
            .ToList();

        var response = new SaloonDashboardResponse
        {
            TotalStaff = staff.Count(s => s.IsActive),
            TotalSeats = activeSeats.Count,
            TotalServices = services.Count(s => s.IsActive),
            TodaysRevenue = paidBookings.Where(b => b.BookingDate == today).Sum(b => b.TotalAmount),
        };

        for (var i = MonthlyRevenueMonths - 1; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var monthRevenue = paidBookings
                .Where(b => b.BookingDate.Year == monthStart.Year && b.BookingDate.Month == monthStart.Month)
                .Sum(b => b.TotalAmount);

            response.MonthlyRevenue.Add(new MonthlyRevenuePoint
            {
                Month = monthStart.ToString("MMM yyyy"),
                Revenue = monthRevenue
            });
        }

        for (var i = DailyRevenueDays - 1; i >= 0; i--)
        {
            var day = DateOnly.FromDateTime(now.Date.AddDays(-i));
            var dayRevenue = paidBookings
                .Where(b => b.BookingDate == day)
                .Sum(b => b.TotalAmount);

            response.DailyRevenue.Add(new DailyRevenuePoint
            {
                Day = day.ToString("MMM d"),
                Revenue = dayRevenue
            });
        }

        // Upcoming seat availability: for each of the next few open hours today, how many of the
        // active seats are NOT overlapped by a live booking in that hour window.
        var todaysLiveBookings = bookings
            .Where(b => b.BookingDate == today &&
                        b.Status != SaloonBookingStatus.Cancelled &&
                        b.Status != SaloonBookingStatus.NoShow)
            .ToList();

        var startHour = Math.Max(now.Hour, OpenHour);
        var bucketsAdded = 0;
        for (var hour = startHour; hour < CloseHour && bucketsAdded < UpcomingHoursCount; hour++)
        {
            var bucketStart = TimeSpan.FromHours(hour);
            var bucketEnd = TimeSpan.FromHours(hour + 1);

            var bookedSeatCount = todaysLiveBookings
                .Where(b => b.StartTime < bucketEnd && b.EndTime > bucketStart)
                .Select(b => b.SaloonId)
                .Distinct()
                .Count();

            response.UpcomingSeatAvailability.Add(new SeatAvailabilityPoint
            {
                HourLabel = FormatHourRange(hour),
                FreeSeats = Math.Max(0, activeSeats.Count - bookedSeatCount),
                TotalSeats = activeSeats.Count
            });

            bucketsAdded++;
        }

        return response;
    }

    private static string FormatHourRange(int hour)
    {
        var start = DateTime.Today.AddHours(hour);
        var end = DateTime.Today.AddHours(hour + 1);
        return $"{start:h tt} - {end:h tt}";
    }
}
