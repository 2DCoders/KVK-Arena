using kvk.BuildingBlocks.Common;
using kvk.Gaming.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gaming.Features.GamingCategory;

[ApiController]
[Route("api/gaming-m/gaming-categories")]
public class GamingCategoryController : ControllerBase
{
    private readonly IGamingCategoryService _service;

    public GamingCategoryController(IGamingCategoryService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] GamingCategoryCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] GamingCategoryUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<GamingCategoryResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _service.GetByIdAsync(id, cancellationToken);

        if (response == null)
            return NotFound();

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<List<GamingCategoryResponse>>> GetPagedList([FromQuery] GamingCategoryPagedRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetGameCategoryListAsync(request, cancellationToken);
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