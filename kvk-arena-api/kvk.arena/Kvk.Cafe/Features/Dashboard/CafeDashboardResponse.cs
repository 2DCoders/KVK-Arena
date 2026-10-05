namespace Kvk.Cafe.Features.Dashboard;

public class CafeDashboardResponse
{
    public int TotalCoffeeItems { get; set; }
    public int TotalBreakfastItems { get; set; }
    public decimal TodaysRevenue { get; set; }
    public int TodaysTransactions { get; set; }

    public List<MonthlyRevenuePoint> MonthlyRevenue { get; set; } = new();
    public List<DailyRevenuePoint> DailyRevenue { get; set; } = new();
}

public class MonthlyRevenuePoint
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class DailyRevenuePoint
{
    public string Day { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}
