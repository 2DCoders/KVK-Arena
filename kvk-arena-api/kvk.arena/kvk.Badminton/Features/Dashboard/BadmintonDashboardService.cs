using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using kvk.Badminton.Interfaces;

namespace kvk.Badminton.Features.Dashboard;

public class BadmintonDashboardService : IBadmintonDashboardService
{
    private const int MonthlyRevenueMonths = 6;
    private const int DailyRevenueDays = 14;
    private const int BookingFetchPageSize = 10000;

    private readonly ICourtService _courtService;
    private readonly IBookingService _bookingService;

    public BadmintonDashboardService(ICourtService courtService, IBookingService bookingService)
    {
        _courtService = courtService ?? throw new ArgumentNullException(nameof(courtService));
        _bookingService = bookingService ?? throw new ArgumentNullException(nameof(bookingService));
    }

    public async Task<BadmintonDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var courts = await _courtService.GetAllAsync(cancellationToken);

        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);

        // Upcoming guests: confirmed bookings from today onward, refined in-memory to the exact
        // slot date+time since BookingDate is date-only and the time-of-day lives on the slot.
        var upcomingCandidates = await _bookingService.GetBookingsListAsync(new GetBookingsListRequest
        {
            FromDate = today,
            Status = BookingStatus.Confirmed,
            PageNumber = 1,
            PageSize = BookingFetchPageSize
        }, cancellationToken);

        var upcomingGuestsCount = upcomingCandidates
            .Count(b => b.SlotDate.ToDateTime(b.SlotStartTime) >= now);

        // Revenue window: last 6 months through today.
        var rangeStart = DateOnly.FromDateTime(new DateTime(now.Year, now.Month, 1).AddMonths(-(MonthlyRevenueMonths - 1)));
        var bookings = await _bookingService.GetBookingsListAsync(new GetBookingsListRequest
        {
            FromDate = rangeStart,
            ToDate = today,
            PageNumber = 1,
            PageSize = BookingFetchPageSize
        }, cancellationToken);

        var paidBookings = bookings
            .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Completed)
            .ToList();

        var response = new BadmintonDashboardResponse
        {
            TotalCourts = courts.Count(),
            UpcomingGuestsCount = upcomingGuestsCount,
            TodaysRevenue = paidBookings.Where(b => b.SlotDate == today).Sum(b => b.BookingAmount),
            TodaysTransactions = bookings.Count(b => b.SlotDate == today),
        };

        for (var i = MonthlyRevenueMonths - 1; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var monthRevenue = paidBookings
                .Where(b => b.SlotDate.Year == monthStart.Year && b.SlotDate.Month == monthStart.Month)
                .Sum(b => b.BookingAmount);

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
                .Where(b => b.SlotDate == day)
                .Sum(b => b.BookingAmount);

            response.DailyRevenue.Add(new DailyRevenuePoint
            {
                Day = day.ToString("MMM d"),
                Revenue = dayRevenue
            });
        }

        return response;
    }
}
