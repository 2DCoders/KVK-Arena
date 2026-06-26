namespace kvk.Gaming.Features.GamingSlotConfiguration;

public class GamingSlotConfigurationResponse
{
    public Guid Id { get; set; }
    public Guid GamingStationId { get; set; }
    public string GamingCategoryName { get; set; } = string.Empty;
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public int SlotGapMinutes { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}