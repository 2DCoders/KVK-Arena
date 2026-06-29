using kvk.Badminton.Interfaces;
using kvk.BuildingBlocks.Common;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Badminton.Features.Booking;

[ApiController]
[Route("api/badminton/bookings")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _service;

    public BookingController(IBookingService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost("hold")]
    public async Task<IActionResult> CreateHold([FromBody] BookingHoldRequest request, CancellationToken ct)
    {
        var result = await _service.CreateHoldAsync(request, ct);
        
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("confirm/{holdId:guid}")]
    public async Task<IActionResult> Confirm(Guid holdId,[FromBody] CustomerDetails customerDetails, [FromQuery] string paymentIntentId, CancellationToken ct)
    {
        var result = await _service.ProcessPaymentSuccessAsync(holdId,customerDetails, paymentIntentId, ct);

        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found")) return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("multi-hold")]
    public async Task<IActionResult> CreateMultiHold([FromBody] MultiBookingRequest request, CancellationToken ct)
    {
        var result = await _service.CreateMultiHoldAsync(request, ct);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("create")] // New endpoint for single booking with payment
    public async Task<IActionResult> CreateSingleBookingWithPayment([FromBody] SingleBookingWithPaymentRequest request, CancellationToken ct)
    {
        var result = await _service.CreateSingleBookingWithPaymentAsync(request, ct);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("notify")]
    public async Task<IActionResult> PaymentNotification([FromForm] PaymentNotificationRequest request, CancellationToken ct)
    {
        await _service.VerifyPaymentNotificationAsync(request, ct);
        return Ok();
    }

    [HttpPost("internal/cleanup")]
    public async Task<IActionResult> Cleanup(CancellationToken ct)
    {
        var result = await _service.CleanupExpiredHoldsAsync(ct);
        return Ok(result);
    }
}