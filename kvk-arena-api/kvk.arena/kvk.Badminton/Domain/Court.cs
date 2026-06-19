using System.ComponentModel.DataAnnotations;
using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Domain;

public class Court : AuditableEntity
{
    [MaxLength(50)]
    public required string Name { get; set; }

    public CourtStatus Status { get; set; } = CourtStatus.Active;
    
    /// <summary>
    /// Default price per booking slot
    /// </summary>
    public decimal PricePerSlot { get; set; }
    
    public ICollection<CourtSlotConfiguration> SlotConfigurations { get; set; } = new List<CourtSlotConfiguration>();

    public ICollection<CourtBooking> Bookings { get; set; } = new List<CourtBooking>();
}
