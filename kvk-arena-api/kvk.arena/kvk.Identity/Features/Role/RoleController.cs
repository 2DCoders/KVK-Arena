using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Features.Role;

[ApiController]
[Route("api/identity-m/roles")]
public class RoleController : ControllerBase
{
    private readonly RoleService _roleService;

    public RoleController(RoleService roleService)
    {
        _roleService = roleService ?? throw new ArgumentNullException(nameof(roleService));
    }

    /// <summary>
    /// Create a new role.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] RoleCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _roleService.CreateAsync(request, cancellationToken);
        
        if (!result.Succeeded)
            return BadRequest(result);

        if (result.AdditionalData.TryGetValue("response", out var responseData) && responseData is RoleResponse response)
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, result);

        return Ok(result);
    }

    /// <summary>
    /// Get a role by ID.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _roleService.GetByIdAsync(id, cancellationToken);
        
        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }

    /// <summary>
    /// Get all roles with optional filtering.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var result = await _roleService.GetAllAsync(isActive, cancellationToken);
        
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Update an existing role.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] RoleUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (id != request.Id)
            return BadRequest(new { message = "ID mismatch between URL and request body" });

        var result = await _roleService.UpdateAsync(request, cancellationToken);
        
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    /// <summary>
    /// Delete a role by ID.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _roleService.DeleteAsync(id, cancellationToken);
        
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }


    [HttpPost("assign-permissions-to-role")]
    public async Task<IActionResult> AssignPermissionsToRoleAsync(Guid roleId, List<string> permissionIds,
        CancellationToken cancellationToken = default)
    {
        var result = await _roleService.AssignPermissionsToRoleAsync(roleId, permissionIds, cancellationToken);
        return Ok(result);
    }

    [HttpGet("get-permissions-by-role-id")]
    public async Task<IActionResult> GetPermissionsByRoleIdAsync(Guid roleId,
        CancellationToken cancellationToken = default)
    {
        var result = await _roleService.GetPermissionsForTheRoleAsync(roleId, cancellationToken);
        return Ok(result);
    }

}

