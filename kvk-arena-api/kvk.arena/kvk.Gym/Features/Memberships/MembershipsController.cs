using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Services;
using kvk.Gym.Features.Memberships;

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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }
}

