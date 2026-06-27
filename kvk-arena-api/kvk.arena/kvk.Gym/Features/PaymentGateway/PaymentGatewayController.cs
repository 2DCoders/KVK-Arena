using kvk.BuildingBlocks.Common;
using kvk.Gym.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gym.Features.PaymentGateway;

[ApiController]
[Route("api/payments")]
public class PaymentGatewayController : ControllerBase
{
    private readonly IGymPaymentGatewayService _paymentGatewayService;

    public PaymentGatewayController(IGymPaymentGatewayService paymentGatewayService)
    {
        _paymentGatewayService = paymentGatewayService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] PaymentGatewayRequest request)
    {
        var response = await _paymentGatewayService.ProcessPayment(request);
        return Ok(response);
    }

    [HttpPost("notify")]
    public async Task<IActionResult> PaymentNotification([FromForm] PaymentNotificationRequest request)
    {
        await _paymentGatewayService.VerifyPayment(request);
        return Ok();
    }
}