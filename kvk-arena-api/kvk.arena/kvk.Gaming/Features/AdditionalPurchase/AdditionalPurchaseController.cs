using kvk.BuildingBlocks.Common;
using kvk.Gaming.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gaming.Features.AdditionalPurchase;

[ApiController]
[Route("api/gaming-m/additional-purchases")]
public class AdditionalPurchaseController : ControllerBase
{
    private readonly IAdditionalPurchaseService _service;

    public AdditionalPurchaseController(IAdditionalPurchaseService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AdditionalPurchaseCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] AdditionalPurchaseUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AdditionalPurchaseResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _service.GetByIdAsync(id, cancellationToken);

        if (response == null)
            return NotFound();

        return Ok(response);
    }

    [HttpGet]
    public async Task<ActionResult<List<AdditionalPurchaseResponse>>> GetPagedList([FromQuery] AdditionalPurchasePagedRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPagedListAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("by-category/{categoryId:guid}")]
    public async Task<ActionResult<List<AdditionalPurchaseResponse>>> GetByCategory(Guid categoryId, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetByCategoryAsync(categoryId, cancellationToken);
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
