using kvk.Gym.Domain;
using kvk.Gym.Enums;
using Gender = kvk.BuildingBlocks.Common.Gender;

namespace kvk.Gym.Features.Memberships;

public class MembershipResponse : TrainerSpecializedResponse
{
    public Guid Id { get; set; }
    public string MembershipNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public Gender Gender { get; set; }
    public string MembershipStatus { get; set; } = string.Empty;
    public Guid? MembershipPlanId { get; set; }
    
    public MembershipPlan? MembershipPlan { get; set; }
    public MemberPayment? MemberPayment { get; set; }
    public string? MembershipPlanTitle { get; set; }
    public decimal? MembershipPlanPrice { get; set; }
    public DateTime? MembershipStartDate { get; set; }
    public DateTime? MembershipEndDate { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public int? MembershipPlanDurationInDays { get; set; }
    public string? IdentityUserId { get; set; }
    public bool IsSavedFingerprints  { get; set; }
    
    public int RewardPoints { get; set; }
    
    public string? AssignedTrainer { get; set; }
    public bool IsDeleted { get; set; }
    
    public DateTime? CreatedDate { get; set; }

}
