using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Domain;

public class CourtSlot : AuditableEntity
{
    public Guid CourtId { get; set; }

    public Court Court { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public bool IsActive { get; set; }

    public decimal Price { get; set; }
    
}