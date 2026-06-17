namespace kvk.Badminton.Features.Booking;

public class BookingHoldRequest
{
    public Guid CourtId { get; set; }
    public Guid CourtSlotId { get; set; }
    public DateOnly BookingDate { get; set; }
    public decimal Amount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}