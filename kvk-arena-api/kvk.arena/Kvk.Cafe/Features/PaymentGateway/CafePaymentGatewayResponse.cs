namespace Kvk.Cafe.Features.PaymentGateway;

public class CafePaymentGatewayResponse
{
    public string MerchantId { get; set; } = null!;
    public string OrderId { get; set; } = null!;
    public string Currency { get; set; } = null!;
    public string Amount { get; set; } = null!;
    public string Hash { get; set; } = null!;
}  