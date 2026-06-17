namespace kvk.Gym.Features.Memberships;

public class TrainerSpecializedResponse
{
        
    public byte[]? ProfilePicture { get; set; } = [];
    
    public string? Specialization { get; set; } = string.Empty;
    public int Rating { get; set; } = 0;
    public int YearsOfExperience { get; set; } = 0;
}