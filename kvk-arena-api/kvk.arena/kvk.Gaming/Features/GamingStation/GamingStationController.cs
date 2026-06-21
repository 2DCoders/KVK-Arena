using kvk.BuildingBlocks.Common;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gaming.Features.GamingStation;

[ApiController]
[Route("api/gaming-m/gaming-stations")]
public class GamingStationController : ControllerBase
{
    private readonly GamingStationService _service;

    public GamingStationController(GamingStationService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] GamingStationCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);
        
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] GamingStationUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GamingStationResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _service.GetByIdAsync(id, cancellationToken);

        if (response == null)
            return NotFound();

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<List<GamingStationResponse>>> GetList([FromQuery] GamingStationListRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetListAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("by-category/{categoryId:guid}")]
    public async Task<ActionResult<List<GamingStationResponse>>> GetStationsByCategory(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetStationsByCategoryAsync(categoryId, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> SoftDelete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.SoftDeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.ActivateAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}/deactivate")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.DeactivateAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}