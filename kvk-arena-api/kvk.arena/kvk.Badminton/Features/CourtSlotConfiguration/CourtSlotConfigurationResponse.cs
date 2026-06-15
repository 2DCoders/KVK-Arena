namespace kvk.Badminton.Features.CourtSlotConfiguration;

public class CourtSlotConfigurationResponse
{
    public Guid Id { get; set; }
    public Guid CourtId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public int SlotGapMinutes { get; set; }
    /// <summary>
    /// Maps to the domain field provided (decimal? IsActive)
    /// </summary>
    public decimal? IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}