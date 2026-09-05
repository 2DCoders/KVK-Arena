using kvk.BuildingBlocks.Common;

namespace kvk.Saloon.Domain;

public class SaloonService : AuditableEntity
{
    public Guid SaloonId { get; set; }

    public string Name { get; set; } = null!;
    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int DurationMinutes { get; set; }

    public int BufferMinutes { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual Saloon Saloon { get; set; } = null!;

    public virtual ICollection<SaloonStaffService> StaffServices { get; set; }
        = new List<SaloonStaffService>();

    public virtual ICollection<SaloonBookingService> BookingServices { get; set; }
        = new List<SaloonBookingService>();
}