using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Domain;

public class TrainerApprovalRequests : User
{
    //Comma seperated list of specializations, e.g. "Strength Training, Cardio, Yoga"
    public string? Specialization { get; set; }
    
    public int Rating { get; set; }

    public int YearsOfExperience { get; set; }
    
    public bool IsDeleted { get; set; }
    
    public DateTime? DeletedAt { get; set; }

    //Foriegn Key
    public Guid? TrainerId { get; set; }

    public ApprovalStatus ApprovalStatus { get; set; }
    
    public DateTime ApprovalDate { get; set; }
    
    [MaxLength(200)]
    public required string ApprovedBy {get; set;}
    
    public Trainer Trainer { get; set; } = default!;
    
    public DateTime DateOfBirth { get; set; }
    
    public byte[]? ProfilePicture { get; set; }
    
    [MaxLength(20)]
    public string? Role { get; set; }
    
    public bool IsFreelance { get; set; }
    
    
    

    
}

public enum ApprovalStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3,
    
}