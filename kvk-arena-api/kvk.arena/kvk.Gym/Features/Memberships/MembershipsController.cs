using Microsoft.AspNetCore.Mvc;
using kvk.Gym.Interfaces;
namespace kvk.Gym.Features.Memberships;

[ApiController]
[Route("api/gym/members")]
public class MembershipsController : ControllerBase
{
    private readonly IMembershipService _service;

    public MembershipsController(IMembershipService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMembershipRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateMemberAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = ((dynamic)result.AdditionalData["response"]).Id }, result);
    }

    [HttpPut("{id:guid}/fingerprints")]
    public async Task<IActionResult> UpdateFingerprints(Guid id, [FromBody] UpdateFingerprintsRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateFingerprintsAsync(id, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Edit(Guid id, [FromBody] EditMembershipRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.EditMemberAsync(id, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("{id:guid}/upgrade")]
    public async Task<IActionResult> Upgrade(Guid id, [FromBody] UpgradeMembershipPlanRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpgradeMembershipPlanAsync(id, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
    
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken = default)
    {
        // For simplicity, this example does not implement pagination or filtering
        var result = await _service.GetAllMembersAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPost("{id:guid}/soft-delete")]
    public async Task<IActionResult> SoftDelete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.SoftDeleteMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> PermanentlyDelete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.PermanentlyDeleteMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return NoContent();
    }
}

