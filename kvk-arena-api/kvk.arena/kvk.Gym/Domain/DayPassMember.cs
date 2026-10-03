using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Enums;
using kvk.Gym.Enums;

namespace kvk.Gym.Domain;

public class DayPassMember : AuditableEntity
{
    [MaxLength(100)]
    public required string Name { get; set; } = string.Empty;
    
    public required string MobileNumber { get; set; } = string.Empty;
    
    public DateTime Date { get; set; }
    
    public decimal Amount { get; set; }
    
    public Guid MembershipPlanId { get; set; } 
    
    public MembershipPlan MembershipPlan { get; set; }
    
    public PaymentType PaymentType { get; set; }
    
    public PaymentStatus PaymentStatus { get; set; }
    
    public string? TemporaryMembershipNumber { get; set; }
    
}