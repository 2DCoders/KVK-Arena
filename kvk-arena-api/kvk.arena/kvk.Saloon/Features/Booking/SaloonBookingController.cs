using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.Booking;

[ApiController]
[Route("api/saloon/saloons/bookings")]
public class SaloonBookingController : ControllerBase
{
    private readonly ISaloonBookingService _service;

    public SaloonBookingController(ISaloonBookingService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var bookings = await _service.GetAllAsync(cancellationToken);
        return Ok(bookings);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost("~/api/saloon/bookings")]
    public async Task<IActionResult> Create([FromBody] SaloonBookingCreateRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("~/api/saloon/bookings/availability")]
    public async Task<IActionResult> CheckAvailability([FromQuery] SaloonBookingAvailabilityRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CheckAvailabilityAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaloonBookingUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (id != request.Id)
            return BadRequest("ID mismatch");

        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
