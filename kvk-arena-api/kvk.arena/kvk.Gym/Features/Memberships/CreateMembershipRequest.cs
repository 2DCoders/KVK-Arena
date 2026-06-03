namespace kvk.Gym.Features.Memberships;

public class CreateMembershipRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    
    public string Password { get; set; } = string.Empty;
    
    public string? Phone { get; set; }
    public DateTime DateOfBirth { get; set; }
    public kvk.Gym.Enums.MemberType MemberType { get; set; }
    public kvk.Gym.Enums.Gender Gender { get; set; }
    public Guid? MembershipPlanId { get; set; }
    public string? DeviceFingerprintId1 { get; set; }
    public string? DeviceFingerprintId2 { get; set; }
}
