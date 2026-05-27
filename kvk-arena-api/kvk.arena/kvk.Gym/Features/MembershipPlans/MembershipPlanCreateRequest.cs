namespace kvk.Gym.Features.MembershipPlans;

public class MembershipPlanCreateRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationInDays { get; set; }
    public kvk.Gym.Enums.ActiveStatus IsActive { get; set; } = kvk.Gym.Enums.ActiveStatus.Active;
    public string? Features { get; set; }
}

