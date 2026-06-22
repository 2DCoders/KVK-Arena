using kvk.BuildingBlocks.Common;
using kvk.Gaming.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gaming.Features.GamingBooking;

[ApiController]
[Route("api/gaming-m/gaming-bookings")]
public class GamingBookingController : ControllerBase
{
    private readonly IGamingBookingService _service;

    public GamingBookingController(IGamingBookingService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> CreateGamingBooking([FromBody] CreateGamingBookingRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateGamingBookingAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("cancel")]
    public async Task<IActionResult> CancelGamingBooking([FromBody] CancelGamingBookingRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CancelGamingBookingAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GamingBookingResponse>> GetGamingBookingById(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _service.GetGamingBookingByIdAsync(id, cancellationToken);

        if (response == null)
            return NotFound();

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<List<GamingBookingResponse>>> GetGamingBookingsList([FromQuery] GetGamingBookingsListRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetGamingBookingsListAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("by-station")]
    public async Task<ActionResult<List<GamingBookingResponse>>> GetBookingsByGamingStation([FromQuery] GetBookingsByGamingStationRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetBookingsByGamingStationAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("by-customer")]
    public async Task<ActionResult<List<GamingBookingResponse>>> GetBookingsByCustomer([FromQuery] GetBookingsByCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetBookingsByCustomerAsync(request, cancellationToken);
        return Ok(result);
    }
}