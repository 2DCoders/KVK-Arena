using kvk.BuildingBlocks.Auth;
using kvk.Badminton.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Badminton.Features.CourtSlotConfiguration;

[ApiController]
[Route("api/badminton/court-slot-configurations")]
public class CourtSlotConfigurationController : ControllerBase
{
    private readonly ICourtSlotConfigurationService _service;

    public CourtSlotConfigurationController(ICourtSlotConfigurationService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet("court/{courtId:guid}")]
    [AuthorizeByPermission("KVK:Badminton:CourtSlotConfiguration:View")]
    public async Task<IActionResult> GetByCourtId(Guid courtId, CancellationToken cancellationToken)
    {
        var result = await _service.GetByCourtIdAsync(courtId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("court-slots-by-id/{courtId:guid}")]
    [AuthorizeByPermission("KVK:Badminton:CourtSlotConfiguration:View")]
    public async Task<IActionResult> GetAllSlotsByCourtId(Guid courtId, CancellationToken cancellationToken)
    {
        var result = await _service.GetSlotsByCourtIdAsync(courtId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("availability-by-court")]
    [AuthorizeByPermission("KVK:Badminton:BookingAvailability:View")]
    public async Task<IActionResult> GetByCourtIdAndDate([FromQuery] Guid courtId, [FromQuery] DateOnly date,
        CancellationToken cancellationToken)
    {
        var result = await _service.GetByCourtIdAndDateAsync(courtId, date, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Badminton:CourtSlotConfiguration:Create")]
    public async Task<IActionResult> Create([FromBody] CourtSlotConfigurationCreateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [AuthorizeByPermission("KVK:Badminton:CourtSlotConfiguration:Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CourtSlotConfigurationUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (id != request.Id) return BadRequest("ID mismatch");

        var result = await _service.UpdateAsync(request, cancellationToken);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [AuthorizeByPermission("KVK:Badminton:CourtSlotConfiguration:Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded) return BadRequest(result);
        return Ok(result);
    }
}
