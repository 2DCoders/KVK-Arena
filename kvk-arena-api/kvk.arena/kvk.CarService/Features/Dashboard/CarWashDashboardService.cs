using kvk.CarService.Interfaces;

namespace kvk.CarService.Features.Dashboard;

public class CarWashDashboardService : ICarWashDashboardService
{
    private const int MonthlyRevenueMonths = 6;
    private const int DailyRevenueDays = 14;

    private readonly ICarWashService _carWashService;
    private readonly IPackageService _packageService;
    private readonly ICarWashOrderService _orderService;

    public CarWashDashboardService(ICarWashService carWashService, IPackageService packageService,
        ICarWashOrderService orderService)
    {
        _carWashService = carWashService ?? throw new ArgumentNullException(nameof(carWashService));
        _packageService = packageService ?? throw new ArgumentNullException(nameof(packageService));
        _orderService = orderService ?? throw new ArgumentNullException(nameof(orderService));
    }

    public async Task<CarWashDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        var services = await _carWashService.GetCarWashServiceAsync(Guid.Empty, cancellationToken);
        var packages = await _packageService.GetPackagesAsync(Guid.Empty, cancellationToken);

        var now = DateTime.Now;
        var rangeStart = new DateTime(now.Year, now.Month, 1).AddMonths(-(MonthlyRevenueMonths - 1));
        var orders = await _orderService.GetCarWashOrdersByDateRangeAsync(rangeStart, now, cancellationToken);
        var paidOrders = orders.Where(o => o.IsPaid).ToList();

        var response = new CarWashDashboardResponse
        {
            TotalServices = services.Count,
            TotalPackages = packages.Count,
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
