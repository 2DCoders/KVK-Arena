namespace kvk.Badminton.Features.Booking;

public class MultiPaymentRequest
{
    public List<Guid> HoldIds { get; set; } = new List<Guid>();
    public CustomerDetails CustomerDetails { get; set; } = new CustomerDetails();
    public string PaymentIntentId { get; set; } = string.Empty;
}