using Microsoft.AspNetCore.Authorization;
using kvk.Gym.Domain;
using kvk.Gym.Features.Trainers;
using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Features.TrainersApprovalRequest;

[Authorize]
[ApiController]
[Route("api/gym/trainers")]
public class TrainersApprovalRequestController : ControllerBase
{
    private readonly TrainerApprovalRequestService _approvalRequestService;

    public TrainersApprovalRequestController(TrainerApprovalRequestService approvalRequestService)
    {
        _approvalRequestService = approvalRequestService ?? throw new ArgumentNullException(nameof(approvalRequestService));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] TrainerApprovalRequestCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (!User.CanAccessMember(request.Id)) return Forbid();
        var result = await _approvalRequestService.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        if (!User.CanAccessMember(id)) return Forbid();
        var result = await _approvalRequestService.GetPendingRecordByIdAsync(id, cancellationToken);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }
    
    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.GetAllAsync(cancellationToken);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromForm] TrainerApprovalRequstUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (!User.CanAccessMember(id)) return Forbid();
        var result = await _approvalRequestService.UpdateAsync(id, request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
    
    //this is for admin to approve or reject the trainer approval request
    [Authorize(Policy = ModuleConstants.GymStaffPolicy)]
    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id,ApprovalStatus approvalStatus, CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.ApproveAsync(id,approvalStatus, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}

