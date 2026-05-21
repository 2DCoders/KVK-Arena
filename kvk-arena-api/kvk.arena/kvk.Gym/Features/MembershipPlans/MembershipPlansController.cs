using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Services;

namespace kvk.Gym.Features.MembershipPlans;

[ApiController]
[Route("api/gym/membership-plans")]
public class MembershipPlansController : ControllerBase
{
    private readonly IMembershipPlanService _service;

    public MembershipPlansController(IMembershipPlanService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MembershipPlanCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = ((dynamic)result.AdditionalData["response"]).Id }, result);
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken = default)
    {
        var result = await _service.GetAllAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] MembershipPlanUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateAsync(id, request, cancellationToken);
        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
                return NotFound(result);

            return BadRequest(result);
        }

        return Ok(result);
    }
}

