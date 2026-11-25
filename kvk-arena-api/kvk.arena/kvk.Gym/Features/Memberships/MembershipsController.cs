using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using kvk.Gym.Interfaces;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Enums;

namespace kvk.Gym.Features.Memberships;

[Authorize]
[ApiController]
[Route("api/gym/members")]
public class MembershipsController : ControllerBase
{
    private readonly IMembershipService _service;

    public MembershipsController(IMembershipService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMembershipRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!User.IsStaff())
        {
            if (request.MemberType != MemberType.Client) return Forbid();
            request.DeviceFingerprintId1 = null;
            request.DeviceFingerprintId2 = null;
        }
        var result = await _service.CreateMemberAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = ((dynamic)result.AdditionalData["response"]).Id }, result);
    }


    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] MemberLoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.LoginAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(Guid memberId, [FromBody] ChangeGymPasswordRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!User.CanAccessMember(memberId)) return Forbid();
        var result =
            await _service.ChangePasswordAsync(memberId, request.OldPassword, request.NewPassword, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }


    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpPut("{id:guid}/fingerprints")]
    public async Task<IActionResult> UpdateFingerprints(Guid id, [FromBody] UpdateFingerprintsRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateFingerprintsAsync(id, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Edit(Guid id, [FromBody] EditMembershipRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!User.CanAccessMember(id)) return Forbid();
        var result = await _service.EditMemberAsync(id, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpPost("{id:guid}/upgrade")]
    public async Task<IActionResult> Upgrade(Guid id, [FromBody] UpgradeMembershipPlanRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.UpgradeMembershipPlanAsync(id, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        // For simplicity, this example does not implement pagination or filtering
        var result = await _service.GetAllMembersAsync(includeDeleted, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        if (!User.CanAccessMember(id)) return Forbid();
        var result = await _service.GetMemberAsync(id, cancellationToken);
        return Ok(result);
    }

    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpPost("{id:guid}/soft-delete")]
    public async Task<IActionResult> SoftDelete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.SoftDeleteMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return NoContent();
    }

    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpPost("{id:guid}/reverse-soft-delete")]
    public async Task<IActionResult> ReverseSoftDelete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.ReverseSoftDeleteMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return NoContent();
    }


    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> PermanentlyDelete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.PermanentlyDeleteMemberAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return NoContent();
    }

    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpPost("{id:guid}/assign-trainer")]
    public async Task<IActionResult> AssignTrainer(Guid id, [FromBody] AssignTrainerRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await _service.AssignTrainerAsync(id, request.TrainerId, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
    
    
    [AllowAnonymous]
    [HttpGet("trainers")]
    public async Task<IActionResult> GetAllTrainers([FromQuery] bool includeDeleted = false, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetAllTrainersAsync(includeDeleted && User.IsStaff(), cancellationToken);
        return Ok(result);
    }
}
