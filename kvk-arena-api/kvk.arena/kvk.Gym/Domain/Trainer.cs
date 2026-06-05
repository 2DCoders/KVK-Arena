using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Domain;

public class Trainer : User
{
    //Comma seperated list of specializations, e.g. "Strength Training, Cardio, Yoga"
    public string? Specialization { get; set; }
    
    public int Rating { get; set; }

    public int YearsOfExperience { get; set; }
}