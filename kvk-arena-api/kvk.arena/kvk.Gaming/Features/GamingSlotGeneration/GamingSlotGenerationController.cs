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

    [HttpPost]
    public async Task<IActionResult> GenerateSlotsForSpecificDate([FromBody] GamingCategorySlotConfigurationRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GenerateSlotsForGamingCategoryeAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] GamingSlotConfigurationUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
