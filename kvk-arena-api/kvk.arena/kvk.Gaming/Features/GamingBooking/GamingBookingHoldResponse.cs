using kvk.Gaming.Enums;

namespace kvk.Gaming.Features.GamingBooking;

public class GamingBookingHoldResponse
{
    public Guid HoldId { get; set; }
    public Guid? BookingId { get; set; } // Will be populated after confirmation
    public Guid GamingCategoryId { get; set; }
    public Guid GamingStationId { get; set; }
    public Guid GamingSlotId { get; set; }
    public DateOnly BookingDate { get; set; }
    public GamingBookingHoldStatus Status { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? PaymentIntentId { get; set; }
    public string Message { get; set; } = string.Empty;
}