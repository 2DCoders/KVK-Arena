namespace kvk.Gym.Features.PaymentGateway;

public class PaymentGatewayResponse
{
    public string MerchantId { get; set; } = null!;
    public string OrderId { get; set; } = null!;
    public string Currency { get; set; } = null!;
    public string Amount { get; set; } = null!;
    public string Hash { get; set; } = null!;
}