using Microsoft.AspNetCore.Authorization;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gym.Features.PaymentGateway;

[AllowAnonymous]
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
        try
        {
            return Ok(await _paymentGatewayService.ProcessPayment(request));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(Result.Failure(ex.Message));
        }
    }

    [HttpGet("status/{orderId}")]
    public async Task<IActionResult> PaymentStatus(string orderId, [FromQuery] Guid memberId, CancellationToken cancellationToken)
    {
        var response = await _paymentGatewayService.GetPaymentStatus(orderId, memberId, cancellationToken);
        return response == null ? NotFound(Result.Failure("Payment order not found")) : Ok(response);
    }
    
    [HttpPost("reverse")]
    public async Task<IActionResult> DeletePendingPayment([FromBody]PendingPaymentDeleteRequest request)
    {
        var response = await _paymentGatewayService.DeletePendingPayment(request);
        return response.Succeeded ? Ok(response) : BadRequest(response);
    }

    [HttpPost("notify")]
    public async Task<IActionResult> PaymentNotification([FromForm] PaymentNotificationRequest request)
    {
        await _paymentGatewayService.VerifyPayment(request);
        return Ok();
    }
}
