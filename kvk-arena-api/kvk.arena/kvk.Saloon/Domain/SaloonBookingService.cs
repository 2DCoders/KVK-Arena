using kvk.BuildingBlocks.Common;

namespace kvk.Saloon.Domain;

public class SaloonBookingService : AuditableEntity
{
    public Guid SaloonBookingId { get; set; }

    public Guid SaloonServiceId { get; set; }

    public Guid SaloonStaffId { get; set; }

    public int DurationMinutes { get; set; }

    public decimal Price { get; set; }
    
    public decimal DiscountAmount { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public virtual SaloonBooking Booking { get; set; } = null!;

    public virtual SaloonService Service { get; set; } = null!;

    public virtual SaloonStaff Staff { get; set; } = null!;
}