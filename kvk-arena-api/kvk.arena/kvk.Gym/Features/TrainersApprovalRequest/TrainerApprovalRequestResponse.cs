using kvk.Gym.Domain;

namespace kvk.Gym.Features.Trainers;

public class TrainerApprovalRequestResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public int Rating { get; set; }
    public int YearsOfExperience { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }

    public byte[]? ProfilePicture { get; set; }
    public string? Role { get; set; }
    public bool IsFreelance { get; set; }

    public ApprovalStatus ApprovalStatus { get; set; }

    public DateTime ApprovalDate { get; set; }

    public string ApprovedBy { get; set; } = string.Empty;
}