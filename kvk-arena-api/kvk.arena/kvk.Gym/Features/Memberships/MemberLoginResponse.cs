namespace kvk.Gym.Features.Memberships;

public class MemberLoginResponse
{
    public Guid MemberId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    
}