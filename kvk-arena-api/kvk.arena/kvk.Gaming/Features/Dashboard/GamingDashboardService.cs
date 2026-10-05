using kvk.Gaming.Enums;
using kvk.Gaming.Features.GamingBooking;
using kvk.Gaming.Features.GamingCategory;
using kvk.Gaming.Interfaces;

namespace kvk.Gaming.Features.Dashboard;

public class GamingDashboardService : IGamingDashboardService
{
    private const int MonthlyRevenueMonths = 6;
    private const int DailyRevenueDays = 14;
    private const int BookingFetchPageSize = 10000;

    private readonly IGamingCategoryService _categoryService;
    private readonly IGamingBookingService _bookingService;

    public GamingDashboardService(IGamingCategoryService categoryService, IGamingBookingService bookingService)
    {
        _categoryService = categoryService ?? throw new ArgumentNullException(nameof(categoryService));
        _bookingService = bookingService ?? throw new ArgumentNullException(nameof(bookingService));
    }

    public async Task<GamingDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categoryService.GetGameCategoryListAsync(new GamingCategoryPagedRequest(), cancellationToken);

        var now = DateTime.Now;
        var today = DateOnly.FromDateTime(now);

        // Upcoming guests: confirmed bookings from today onward, refined in-memory to the exact
        // slot date+time since BookingDate is date-only and the time-of-day lives on the slot.
        var upcomingCandidates = await _bookingService.GetGamingBookingsListAsync(new GetGamingBookingsListRequest
        {
            FromDate = today,
            Status = GamingBookingStatus.Confirmed,
            PageNumber = 1,
            PageSize = BookingFetchPageSize
        }, cancellationToken);

        var upcomingGuestsCount = upcomingCandidates
            .Count(b => b.SlotDate.ToDateTime(b.SlotStartTime) >= now);

        // Revenue window: last 6 months through today.
        var rangeStart = DateOnly.FromDateTime(new DateTime(now.Year, now.Month, 1).AddMonths(-(MonthlyRevenueMonths - 1)));
        var bookings = await _bookingService.GetGamingBookingsListAsync(new GetGamingBookingsListRequest
        {
            FromDate = rangeStart,
            ToDate = today,
            PageNumber = 1,
            PageSize = BookingFetchPageSize
        }, cancellationToken);

        var paidBookings = bookings
            .Where(b => b.Status == GamingBookingStatus.Confirmed ||
                        b.Status == GamingBookingStatus.CheckedIn ||
                        b.Status == GamingBookingStatus.Completed)
            .ToList();

        var response = new GamingDashboardResponse
        {
            TotalCategories = categories.Count,
            UpcomingGuestsCount = upcomingGuestsCount,
            TodaysRevenue = paidBookings.Where(b => b.SlotDate == today).Sum(b => b.Amount),
            TodaysTransactions = bookings.Count(b => b.SlotDate == today),
        };

        for (var i = MonthlyRevenueMonths - 1; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var monthRevenue = paidBookings
                .Where(b => b.SlotDate.Year == monthStart.Year && b.SlotDate.Month == monthStart.Month)
                .Sum(b => b.Amount);

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
                .Sum(b => b.Amount);

            response.DailyRevenue.Add(new DailyRevenuePoint
            {
                Day = day.ToString("MMM d"),
                Revenue = dayRevenue
            });
        }

        return response;
    }
}
