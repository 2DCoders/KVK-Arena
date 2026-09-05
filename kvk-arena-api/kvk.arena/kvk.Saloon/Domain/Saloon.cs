using kvk.BuildingBlocks.Common;

namespace kvk.Saloon.Domain;

public class Saloon : AuditableEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    

    public virtual ICollection<SaloonService> Services { get; set; }
        = new List<SaloonService>();

    public virtual ICollection<SaloonSlotConfiguration> SlotConfigurations { get; set; }
        = new List<SaloonSlotConfiguration>();

    public virtual ICollection<SaloonBooking> Bookings { get; set; }
        = new List<SaloonBooking>(); 
}