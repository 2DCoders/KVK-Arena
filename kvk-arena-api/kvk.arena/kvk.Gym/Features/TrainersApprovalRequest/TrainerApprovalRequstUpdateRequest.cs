using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Features.Trainers;

public class TrainerApprovalRequstUpdateRequest
{
    public string? UserName { get; set; } = string.Empty;
    public string? Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public int YearsOfExperience { get; set; }
    public int Rating { get; set; }
    
    public string? FirstName { get; set; }
    
    public string? LastName { get; set; }
    
    public DateTime? DateOfBirth { get; set; }
    
    public Gender? Gender { get; set; }

    public Guid TrainerId { get; set; }
    
    public byte[]? ProfilePicture { get; set; }
    
    [MaxLength(20)]
    public string? Role { get; set; }
    
    public bool IsFreelance { get; set; } = false;
    
    
}

