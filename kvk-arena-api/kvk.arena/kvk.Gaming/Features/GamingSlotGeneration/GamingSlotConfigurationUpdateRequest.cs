namespace kvk.Gaming.Features.GamingSlotGeneration;

public class GamingSlotGenerationConfigurationUpdateRequest
{
    public Guid Id { get; set; }
    public Guid GamingCategoryId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public int SlotGapMinutes { get; set; }
    public decimal? IsActive { get; set; }
}