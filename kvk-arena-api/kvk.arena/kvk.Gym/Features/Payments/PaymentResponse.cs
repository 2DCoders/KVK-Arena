using kvk.BuildingBlocks.Enums;

namespace kvk.Gym.Features.Payments;

public class PaymentResponse
{
    public Guid Id { get; set; }
    public Guid MembershipId { get; set; }
    public decimal Amount { get; set; }
    public PaymentType PaymentType { get; set; }
    public kvk.Gym.Enums.PaymentStatus PaymentStatus { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? TransactionReference { get; set; }
    public DateTime CreatedAt { get; set; }

    // Denormalized fields for analysis/reporting
    public string MemberFirstName { get; set; } = string.Empty;
    public string MemberLastName { get; set; } = string.Empty;
    public string MembershipNumber { get; set; } = string.Empty;
    public string? MembershipPlanTitle { get; set; }
}

