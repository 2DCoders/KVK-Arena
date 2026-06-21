namespace kvk.Gaming.Features.GamingSlotGeneration;

public class GamingSlotResponse
{
    public Guid Id { get; set; }
    public Guid GamingStationId { get; set; }
    public string GamingStationName { get; set; } = string.Empty;
    public Guid GamingSlotConfigurationId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Price { get; set; }
    public bool IsBooked { get; set; }
    public Guid? BookingId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}