using kvk.Gym.Domain;

namespace kvk.Gym.Features.TrainersApprovalRequest;

public class TrainerApprovalRequestCreateRequest
{
    public string UserName { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public int YearsOfExperience { get; set; }
    public byte[]? ProfilePicture { get; set; }
    public string? Role { get; set; }
    public bool IsFreelance { get; set; }
}
