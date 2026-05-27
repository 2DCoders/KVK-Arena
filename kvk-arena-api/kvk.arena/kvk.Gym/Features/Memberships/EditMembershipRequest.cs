namespace kvk.Gym.Features.Memberships;

public class EditMembershipRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public kvk.Gym.Enums.Gender? Gender { get; set; }
}

