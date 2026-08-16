using Microsoft.AspNetCore.Mvc;

namespace kvk.Badminton.Features.CourtBookingTemporary;

[ApiController]
[Route("api/temporary-bookings")]
public class CourtBookingTemporaryController : ControllerBase
{
    private readonly CourtBookingTemporaryService _service;

    public CourtBookingTemporaryController(CourtBookingTemporaryService service)
    {
        _service = service;
    }

    [HttpPost("check-availability")]
    public async Task<IActionResult> CheckAvailability([FromBody] CourtBookingTemporaryAvailabilityCheckRequest request, [FromQuery] string memberId, [FromQuery] string? couponCode = null)
    {
        var response = await _service.CheckAvailabilityAsync(request, memberId, couponCode);
        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromForm] CreateCourtBookingTemporaryRequest request,CancellationToken cancellationToken)
    {
        try
        {
            var bookingId = await _service.CreateBookingAsync(request,cancellationToken);
            return Ok(new { BookingId = bookingId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
}
