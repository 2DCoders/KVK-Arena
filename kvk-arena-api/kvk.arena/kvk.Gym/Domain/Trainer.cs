using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Enums;

namespace kvk.Gym.Domain;

public class Trainer : User
{
    //Comma seperated list of specializations, e.g. "Strength Training, Cardio, Yoga"
    public string? Specialization { get; set; }

    public int Rating { get; set; }

    public int YearsOfExperience { get; set; }
    
    
    public DateTime DateOfBirth { get; set; }
    
    public byte[]? ProfilePicture { get; set; }
    
    [MaxLength(20)]
    public string? Role { get; set; }
    
    public bool IsFreelance { get; set; }


    public bool IsDeleted { get; set; }

    public DateTime? DeletedAt { get; set; }

    public ICollection<TrainerApprovalRequests> ApprovalRequests { get; set; }
        = new List<TrainerApprovalRequests>();
}