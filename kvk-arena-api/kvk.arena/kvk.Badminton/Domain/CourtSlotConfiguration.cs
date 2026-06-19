using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Domain;

public class CourtSlotConfiguration : AuditableEntity
{
    
    public Guid CourtId { get; set; }
    
    public Court Court { get; set; } = null!;
    
    /// <summary>
    /// Start time of the slot (e.g., 08:00)
    /// </summary>
    public TimeOnly StartTime { get; set; }
    
    /// <summary>
    /// End time of the slot (e.g., 09:00)
    /// </summary>
    public TimeOnly EndTime { get; set; }
    
    /// <summary>
    /// Minutes
    /// </summary>
    public int SlotDurationMinutes { get; set; }

    /// <summary>
    /// Gap between slots
    /// </summary>
    public int SlotGapMinutes { get; set; }
    
    /// <summary>
    /// Price for this specific slot (overrides court's default price if set)
    /// </summary>
    public decimal? IsActive { get; set; }
}