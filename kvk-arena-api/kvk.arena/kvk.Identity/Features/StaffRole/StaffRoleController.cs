using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.StaffRole;

[ApiController]
[Route("api/identity-m/staff-roles")]
public class StaffRoleController(StaffRoleService service) : ControllerBase
{
    
    [HttpPost("assign-roles-to-staff")]
    public async Task<IActionResult> AssignRolesToStaffAsync(
        [FromBody] StaffRoleRequest request,
        CancellationToken cancellationToken = default)
    {
        return Ok(await service.AssignStaffMembersRoles(request, cancellationToken));
    }
    
    [HttpGet("assigned-roles-to-staff-member")]
    public async Task<IActionResult> GetAssignedRolesToStaffMemberAsync(
        [FromQuery] Guid staffId,
        CancellationToken cancellationToken = default)
    {
        return Ok(await service.GetStaffRoles(staffId, cancellationToken));
    }
}