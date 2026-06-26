using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingSlotConfiguration : AuditableEntity
{
    public Guid GamingCategoryId { get; set; }
    
    public GamingCategory GamingCategory { get; set; }

    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int SlotDurationMinutes { get; set; } // Duration of each slot in minutes
    public int SlotGapMinutes { get; set; }     // Gap between slots in minutes
    public decimal Price { get; set; }          // Price per slot

    public decimal? IsActive { get; set; }
}