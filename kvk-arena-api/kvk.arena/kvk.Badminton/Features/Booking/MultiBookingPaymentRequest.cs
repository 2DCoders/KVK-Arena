namespace kvk.Badminton.Features.Booking;

public class MultiBookingPaymentRequest
{
    public List<Guid> HoldIds { get; set; } = new();
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
