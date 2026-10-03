using kvk.BuildingBlocks.Common;
using Kvk.Cafe.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Kvk.Cafe.Features.PaymentGateway;

[ApiController]
[Route("api/payments/cafe")]
public class CafePaymentGatewayController : ControllerBase
{
    private readonly ICafePaymentGatewayService _paymentGatewayService;

    public CafePaymentGatewayController(ICafePaymentGatewayService paymentGatewayService)
    {
        _paymentGatewayService = paymentGatewayService;
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreatePayment([FromBody] CafePaymentGatewayRequest request)
    {
        var response = await _paymentGatewayService.ProcessPayment(request);
        return Ok(response);
    }
    
    [HttpPost("reverse")]
    public async Task<IActionResult> DeletePendingPayment([FromBody]CafePendingPaymentDeleteRequest request)
    {
        var response = await _paymentGatewayService.DeletePendingPayment(request);
        return Ok(response);
    }

    [HttpPost("notify")]
    public async Task<IActionResult> PaymentNotification([FromForm] PaymentNotificationRequest request)
    {
        await _paymentGatewayService.VerifyPayment(request);
        return Ok();
    }
}