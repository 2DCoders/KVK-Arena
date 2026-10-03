namespace kvk.Badminton.Features.Booking;

public class BookingPaymentResponse
{
    public string MerchantId { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty;
}
