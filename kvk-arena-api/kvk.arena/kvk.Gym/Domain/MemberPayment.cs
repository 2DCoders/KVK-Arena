using kvk.BuildingBlocks.Common;
using kvk.Gym.Enums;

namespace kvk.Gym.Domain;

public class MemberPayment : AuditableEntity
{
    /// <summary>
    /// FK to the Membership record
    /// </summary>
    public Guid MembershipId { get; set; }

    // Navigation property for easier joins when querying payments
    public Membership? Membership { get; set; }

    public decimal Amount { get; set; }

    public PaymentType PaymentType { get; set; }
    
    public PaymentStatus PaymentStatus { get; set; }
    
    public DateTime? MemberShipStartDate { get; set; }
    
    public DateTime? MemberShipRenewalDate { get; set; }
    
    public DateTime? MemberShipEndDate { get; set; }

    public string? TransactionReference { get; set; }
}