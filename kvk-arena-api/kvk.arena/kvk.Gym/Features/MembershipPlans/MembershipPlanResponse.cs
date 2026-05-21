namespace kvk.Gym.Features.MembershipPlans;

public class MembershipPlanResponse
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationInDays { get; set; }
    public kvk.Gym.Enums.ActiveStatus IsActive { get; set; }
    public string? Features { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}

