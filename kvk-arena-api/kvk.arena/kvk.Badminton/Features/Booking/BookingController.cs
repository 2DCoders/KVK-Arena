using Microsoft.AspNetCore.Mvc;

namespace kvk.Badminton.Features.Booking;

[ApiController]
[Route("api/badminton/bookings")]
public class BookingController : ControllerBase
{
    private readonly BookingService _service;

    public BookingController(BookingService service)
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
    public async Task<IActionResult> Confirm(Guid holdId, [FromQuery] string paymentIntentId, CancellationToken ct)
    {
        var result = await _service.ProcessPaymentSuccessAsync(holdId, paymentIntentId, ct);

        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found")) return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("internal/cleanup")]
    public async Task<IActionResult> Cleanup(CancellationToken ct)
    {
        var result = await _service.CleanupExpiredHoldsAsync(ct);
        return Ok(result);
    }
}