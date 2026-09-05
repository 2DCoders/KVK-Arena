using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.Booking;

[ApiController]
[Route("api/saloon/saloons/{saloonId:guid}/bookings")]
public class SaloonBookingController : ControllerBase
{
    private readonly ISaloonBookingService _service;

    public SaloonBookingController(ISaloonBookingService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid saloonId, CancellationToken cancellationToken)
    {
        var bookings = await _service.GetAllAsync(saloonId, cancellationToken);
        return Ok(bookings);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid saloonId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid saloonId, [FromBody] SaloonBookingCreateRequest request, CancellationToken cancellationToken)
    {
        if (request.SaloonId != saloonId)
            return BadRequest("SaloonId mismatch");

        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid saloonId, Guid id, [FromBody] SaloonBookingUpdateRequest request,
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
    public async Task<IActionResult> Delete(Guid saloonId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
