using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Features.Memberships;

public class EditMembershipRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public Gender? Gender { get; set; }
    
    public string? Specialization { get; set; }
    public int? YearsOfExperience { get; set; }
}

