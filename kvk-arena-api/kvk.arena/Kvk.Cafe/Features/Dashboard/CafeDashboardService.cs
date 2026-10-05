using Kvk.Cafe.Enums;
using Kvk.Cafe.Interfaces;

namespace Kvk.Cafe.Features.Dashboard;

public class CafeDashboardService : ICafeDashboardService
{
    private const int MonthlyRevenueMonths = 6;
    private const int DailyRevenueDays = 14;

    private readonly IMenuService _menuService;
    private readonly IOrderService _orderService;

    public CafeDashboardService(IMenuService menuService, IOrderService orderService)
    {
        _menuService = menuService ?? throw new ArgumentNullException(nameof(menuService));
        _orderService = orderService ?? throw new ArgumentNullException(nameof(orderService));
    }

    public async Task<CafeDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var menuItems = await _menuService.GetMenusAsync(cancellationToken);

        var now = DateTime.Now;
        var rangeStart = new DateTime(now.Year, now.Month, 1).AddMonths(-(MonthlyRevenueMonths - 1));
        var orders = await _orderService.GetOrdersByDateRangeAsync(rangeStart, now, cancellationToken);
        var paidOrders = orders.Where(o => o.IsPaid).ToList();

        var response = new CafeDashboardResponse
        {
            // "Coffee" maps to the MenuCategory.Drinks bucket (the menu has no dedicated
            // Coffee category — this is where coffee items are actually filed).
            TotalCoffeeItems = menuItems.Count(m => m.Category == MenuCategory.Drinks),
            TotalBreakfastItems = menuItems.Count(m => m.Category == MenuCategory.Breakfast),
            TodaysRevenue = paidOrders
                .Where(o => o.OrderDate.Date == now.Date)
                .Sum(o => o.DiscountedTotalAmount),
            TodaysTransactions = orders.Count(o => o.OrderDate.Date == now.Date),
        };

        for (var i = MonthlyRevenueMonths - 1; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var monthRevenue = paidOrders
                .Where(o => o.OrderDate.Year == monthStart.Year && o.OrderDate.Month == monthStart.Month)
                .Sum(o => o.DiscountedTotalAmount);

            response.MonthlyRevenue.Add(new MonthlyRevenuePoint
            {
                Month = monthStart.ToString("MMM yyyy"),
                Revenue = monthRevenue
            });
        }

        for (var i = DailyRevenueDays - 1; i >= 0; i--)
        {
            var day = now.Date.AddDays(-i);
            var dayRevenue = paidOrders
                .Where(o => o.OrderDate.Date == day)
                .Sum(o => o.DiscountedTotalAmount);

            response.DailyRevenue.Add(new DailyRevenuePoint
            {
                Day = day.ToString("MMM d"),
                Revenue = dayRevenue
            });
        }

        return response;
    }
}
