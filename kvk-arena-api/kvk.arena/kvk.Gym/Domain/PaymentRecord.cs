using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Domain;

public class PaymentRecord : AuditableEntity
{
    // FK to Membership
    public Guid MembershipId { get; set; }
    public Membership? Membership { get; set; }

    // Optional link to the MemberPayment entity (if keeping a current/active payment row)
    public Guid? MemberPaymentId { get; set; }

    public decimal Amount { get; set; }

    public kvk.Gym.Enums.PaymentType PaymentType { get; set; }

    public kvk.Gym.Enums.PaymentStatus PaymentStatus { get; set; }

    public DateTime? MemberShipStartDate { get; set; }
    public DateTime? MemberShipRenewalDate { get; set; }
    public DateTime? MemberShipEndDate { get; set; }

    public string? TransactionReference { get; set; }

    // Denormalized snapshot fields for analysis at time of payment
    public string? MembershipNumber { get; set; }
    public Guid? MembershipPlanId { get; set; }
    public string? MembershipPlanTitle { get; set; }
}

