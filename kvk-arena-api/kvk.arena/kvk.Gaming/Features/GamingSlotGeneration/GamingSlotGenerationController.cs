using kvk.BuildingBlocks.Auth;
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
    [AuthorizeByPermission("KVK:Gaming:GamingSlotGeneration:Create")]
    public async Task<IActionResult> GenerateSlotsForGamingCategoryAsync([FromBody] GamingCategorySlotConfigurationRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GenerateSlotsForGamingCategoryeAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut]
    [AuthorizeByPermission("KVK:Gaming:GamingSlotGeneration:Edit")]
    public async Task<IActionResult> Update([FromBody] GamingSlotGenerationConfigurationUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [AuthorizeByPermission("KVK:Gaming:GamingSlotGeneration:Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
    [HttpGet("availability-by-station-category")]
    [AuthorizeByPermission("KVK:Gaming:BookingAvailability:View")]
    public async Task<IActionResult> GetByStationCategoryIdAndDate([FromQuery]Guid stationId,[FromQuery]Guid categoryId,[FromQuery] DateOnly date, CancellationToken cancellationToken)
    {
        var result = await _service.GetByStationCategoryIdAndDate(stationId, categoryId, date, cancellationToken);
        return Ok(result);
    }
    
    //configuration by category
    [HttpGet("configuration-by-category")]
    [AuthorizeByPermission("KVK:Gaming:GamingSlotGeneration:View")]
    public async Task<IActionResult> GetConfigurationByCategory([FromQuery]Guid categoryId, CancellationToken cancellationToken)
    {
        var result = await _service.GetConfigurationByCategory(categoryId, cancellationToken);
        return Ok(result);
    }
}
