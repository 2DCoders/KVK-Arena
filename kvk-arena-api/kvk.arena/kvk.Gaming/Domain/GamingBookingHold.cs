using kvk.BuildingBlocks.Common;
using kvk.Gaming.Enums;

namespace kvk.Gaming.Domain;

public class GamingBookingHold : AuditableEntity
{
    public Guid GamingCategoryId { get; set; }
    public Guid GamingStationId { get; set; }
    public Guid GamingSlotId { get; set; }
    public DateOnly BookingDate { get; set; }
    public decimal Amount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public GamingBookingHoldStatus Status { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string? PaymentIntentId { get; set; } // To store payment gateway intent ID
}