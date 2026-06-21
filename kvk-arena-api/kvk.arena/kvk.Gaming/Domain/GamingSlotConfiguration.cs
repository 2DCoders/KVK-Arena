using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingSlotConfiguration : AuditableEntity
{
    public Guid GamingStationId { get; set; }
    public GamingStation GamingStation { get; set; } = null!;

    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int SlotDurationMinutes { get; set; } // Duration of each slot in minutes
    public int SlotGapMinutes { get; set; }     // Gap between slots in minutes
    public decimal Price { get; set; }          // Price per slot

    public bool IsActive { get; set; }
}