namespace kvk.Gaming.Features.GamingBooking;

public class MultiGamingBookingPaymentRequest
{
    public List<Guid> HoldIds { get; set; } = new();
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
