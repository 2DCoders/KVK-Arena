namespace kvk.Gym.Features.DayPassMembers;

public class DayPassMemberResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public Guid MembershipPlanId { get; set; }
    public string? MembershipPlanTitle { get; set; }
    public string? TemporaryMembershipNumber { get; set; }
    public string PaymentType { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}

