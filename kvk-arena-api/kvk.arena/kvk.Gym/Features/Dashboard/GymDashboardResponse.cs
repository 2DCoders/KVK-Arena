namespace kvk.Gym.Features.Dashboard;

public class GymDashboardResponse
{
    public int TotalMembers { get; set; }
    public int TotalTrainers { get; set; }
    public int TotalMembershipPlans { get; set; }
    public decimal TodaysRevenue { get; set; }

    public List<MonthlyRevenuePoint> MonthlyRevenue { get; set; } = new();

    public int ActiveCount { get; set; }
    public int BlockedCount { get; set; }

    public List<GymDashboardPersonSummary> RecentBlockedMembers { get; set; } = new();
    public List<GymDashboardPersonSummary> RecentBlockedTrainers { get; set; } = new();

    public List<GymDashboardPersonSummary> DeletedMembers { get; set; } = new();
    public List<GymDashboardPersonSummary> DeletedTrainers { get; set; } = new();
}

public class MonthlyRevenuePoint
{
    public string Month { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class GymDashboardPersonSummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MembershipNumber { get; set; } = string.Empty;
    public string MembershipStatus { get; set; } = string.Empty;
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? MembershipPlanTitle { get; set; }
}
