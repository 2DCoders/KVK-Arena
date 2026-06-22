using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingSlot : AuditableEntity
{
    public Guid GamingStationId { get; set; }
    public GamingStation GamingStation { get; set; } = null!;

    public Guid GamingSlotConfigurationId { get; set; }
    public GamingSlotConfiguration GamingSlotConfiguration { get; set; } = null!;

    public DateTime Date { get; set; } // The date for which the slot is generated
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public decimal Price { get; set; }

    public bool IsBooked { get; set; } = false;
    public Guid? BookingId { get; set; } // Nullable, links to a booking if booked

    public bool IsActive { get; set; } = true; // Can be disabled without deleting
}