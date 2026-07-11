using kvk.Badminton.Features.Booking;
using kvk.Gaming.Enums;

namespace kvk.Gaming.Features.GamingBooking;

public class GamingBookingResponse
{
    public Guid Id { get; set; }
    public required string BookingNumber { get; set; }
    public Guid GamingCategoryId { get; set; }
    public string GamingCategoryName { get; set; } = string.Empty;
    public Guid GamingStationId { get; set; }
    public string GamingStationName { get; set; } = string.Empty;
    public Guid GamingSlotId { get; set; }
    public DateOnly SlotDate { get; set; }
    public TimeOnly SlotStartTime { get; set; }
    public TimeOnly SlotEndTime { get; set; }
    public required string CustomerName { get; set; }
    public required string CustomerPhone { get; set; }
    public decimal Amount { get; set; }
    public GamingBookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
    
    public PaymentTypes PaymentType { get; set; }
}