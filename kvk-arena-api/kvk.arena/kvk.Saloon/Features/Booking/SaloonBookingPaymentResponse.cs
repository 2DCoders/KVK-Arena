namespace kvk.Saloon.Features.Booking;

public class SaloonBookingPaymentResponse
{
    public Guid BookingId { get; set; }
    public string MerchantId { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Amount { get; set; } = string.Empty;
    public string Hash { get; set; } = string.Empty;
}
