using kvk.BuildingBlocks.Common;
using kvk.Gaming.Enums;

namespace kvk.Gaming.Domain;

public class GamingBooking : AuditableEntity
{
    public string BookingNumber { get; set; } = null!;

    public Guid GamingCategoryId { get; set; }
    public GamingCategory GamingCategory { get; set; } = null!; // Navigation property

    public Guid GamingStationId { get; set; }
    public GamingStation GamingStation { get; set; } = null!; // Navigation property

    public Guid GamingSlotId { get; set; }
    public GamingSlot GamingSlot { get; set; } = null!; // Navigation property

    public string CustomerName { get; set; } = null!;

    public string CustomerPhone { get; set; } = null!;

    public decimal Amount { get; set; }
    
    public DateOnly BookingDate { get; set; }

    public GamingBookingStatus Status { get; set; }
    
    public string PaymentIntentId { get; set; }
}


