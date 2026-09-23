namespace kvk.Gaming.Features.GamingBooking;

public class MultiGamingPaymentRequest
{
    public List<Guid> HoldIds { get; set; } = new List<Guid>();
    public string PaymentIntentId { get; set; } = string.Empty;
}
