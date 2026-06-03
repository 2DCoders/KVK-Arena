using Microsoft.AspNetCore.Mvc;

namespace kvk.Gym.Features.PaymentGateway;

public class PaymentNotificationRequest
{
    [FromForm(Name = "merchant_id")]
    public string MerchantId { get; set; } = null!;
    [FromForm(Name = "order_id")]
    public string OrderId { get; set; } = null!;
    [FromForm(Name = "payment_id")]
    public string PaymentId { get; set; } = null!;
    [FromForm(Name = "payhere_amount")]
    public decimal PayhereAmount { get; set; }
    [FromForm(Name = "payhere_currency")]
    public string PayhereCurrency { get; set; } = null!;
    [FromForm(Name = "status_code")]
    public int StatusCode { get; set; }
    [FromForm(Name = "md5sig")]
    public string Md5Sig { get; set; } = null!;
}

