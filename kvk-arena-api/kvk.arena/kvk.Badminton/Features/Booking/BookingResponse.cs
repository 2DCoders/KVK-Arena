namespace kvk.Badminton.Features.Booking;

public class BookingResponse
{
    public Guid HoldId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid CourtId { get; set; }
    public Guid CourtSlotId { get; set; }
    public DateOnly BookingDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public string Message { get; set; } = string.Empty;
}