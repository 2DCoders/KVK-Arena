namespace kvk.Gym.Options;

public class GymDayEndOptions
{
    public const string SectionName = "Gym:DayEnd";

    public string? TimeZoneId { get; set; }

    public TimeSpan RunAt { get; set; } = TimeSpan.Zero;
}

