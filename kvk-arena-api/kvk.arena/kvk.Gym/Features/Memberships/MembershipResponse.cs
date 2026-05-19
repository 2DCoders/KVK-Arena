namespace kvk.Gym.Features.Memberships;

public class MembershipResponse
{
    public Guid Id { get; set; }
    public string MembershipNumber { get; set; } = string.Empty;
    public string MembershipStatus { get; set; } = string.Empty;
    public string? IdentityUserId { get; set; }
}
