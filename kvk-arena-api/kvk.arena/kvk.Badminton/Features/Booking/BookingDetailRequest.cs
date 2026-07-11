namespace kvk.Badminton.Features.Booking;

public class BookingDetailRequest
{
    public Guid CourtId { get; set; }
    public Guid CourtSlotId { get; set; }
    public DateOnly BookingDate { get; set; }
}