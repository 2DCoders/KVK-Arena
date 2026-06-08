namespace kvk.Gym.Features.Trainers;

public class TrainerUpdateRequest
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Specialization { get; set; }
    public int YearsOfExperience { get; set; }
    public int Rating { get; set; }
}

