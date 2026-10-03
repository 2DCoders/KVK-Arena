namespace kvk.Saloon.Features.Dashboard;

public class SaloonDashboardResponse
{
    public int TotalStaff { get; set; }
    public int TotalSeats { get; set; }
    public int TotalServices { get; set; }
    public decimal TodaysRevenue { get; set; }

    public List<MonthlyRevenuePoint> MonthlyRevenue { get; set; } = new();
    public List<DailyRevenuePoint> DailyRevenue { get; set; } = new();
    public List<SeatAvailabilityPoint> UpcomingSeatAvailability { get; set; } = new();
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

public class SeatAvailabilityPoint
{
    public string HourLabel { get; set; } = string.Empty;
    public int FreeSeats { get; set; }
    public int TotalSeats { get; set; }
}
