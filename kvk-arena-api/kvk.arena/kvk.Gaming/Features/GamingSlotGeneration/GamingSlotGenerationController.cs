using kvk.BuildingBlocks.Common;
using kvk.Gaming.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gaming.Features.GamingSlotGeneration;

[ApiController]
[Route("api/gaming-m/gaming-slot-generation")]
public class GamingSlotGenerationController : ControllerBase
{
    private readonly IGamingSlotGenerationService _service;

    public GamingSlotGenerationController(IGamingSlotGenerationService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost("generate-single-date")]
    public async Task<IActionResult> GenerateSlotsForSpecificDate([FromBody] GenerateSlotsForDateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GenerateSlotsForSpecificDateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("generate-date-range")]
    public async Task<IActionResult> GenerateSlotsForDateRange([FromBody] GenerateSlotsForDateRangeRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GenerateSlotsForDateRangeAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("regenerate-station-slots")]
    public async Task<IActionResult> RegenerateSlotsForGamingStation([FromBody] RegenerateSlotsForStationRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.RegenerateSlotsForGamingStationAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("disable-slots-for-date")]
    public async Task<IActionResult> DisableGeneratedSlotsForDate([FromBody] DisableGeneratedSlotsForDateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.DisableGeneratedSlotsForDateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("by-station-and-date")]
    public async Task<ActionResult<List<GamingSlotResponse>>> GetSlotsByGamingStationAndDate([FromQuery] GetSlotsByStationAndDateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetSlotsByGamingStationAndDateAsync(request, cancellationToken);
        return Ok(result);
    }
}