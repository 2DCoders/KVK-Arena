using kvk.BuildingBlocks.Auth;
using kvk.Gym.Domain;
using kvk.Gym.Features.Trainers;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gym.Features.TrainersApprovalRequest;

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
    [AuthorizeByPermission("KVK:Gym:TrainerApprovalRequest:Create")]
    public async Task<IActionResult> Create([FromForm] TrainerApprovalRequestCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [AuthorizeByPermission("KVK:Gym:TrainerApprovalRequest:View")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.GetPendingRecordByIdAsync(id, cancellationToken);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }
    
    [HttpGet]
    [AuthorizeByPermission("KVK:Gym:TrainerApprovalRequest:View")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.GetAllAsync(cancellationToken);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [AuthorizeByPermission("KVK:Gym:TrainerApprovalRequest:Edit")]
    public async Task<IActionResult> Update(Guid id, [FromForm] TrainerApprovalRequstUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.UpdateAsync(id, request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [AuthorizeByPermission("KVK:Gym:TrainerApprovalRequest:Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
    
    //this is for admin to approve or reject the trainer approval request
    [HttpPost("{id:guid}/approve")]
    [AuthorizeByPermission("KVK:Gym:TrainerApprovalRequest:Manage")]
    public async Task<IActionResult> Approve(Guid id,ApprovalStatus approvalStatus, CancellationToken cancellationToken = default)
    {
        var result = await _approvalRequestService.ApproveAsync(id,approvalStatus, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}

