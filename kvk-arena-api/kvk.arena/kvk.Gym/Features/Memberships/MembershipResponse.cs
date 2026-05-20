using kvk.Gym.Enums;

namespace kvk.Gym.Features.Memberships;

public class MembershipResponse
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
    public string MembershipPlan { get; set; } = string.Empty;
    public string? IdentityUserId { get; set; }
}
