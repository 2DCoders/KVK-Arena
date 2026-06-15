namespace kvk.Badminton.Features.CourtSlotConfiguration;

public class CourtSlotConfigurationUpdateRequest
{
    public Guid Id { get; set; }
    public Guid CourtId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public int SlotGapMinutes { get; set; }
    public decimal? IsActive { get; set; }
}