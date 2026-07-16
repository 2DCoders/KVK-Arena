using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.StaffModule;

[ApiController]
[Route("api/identity-m/staff/{staffId}/modules")]
public class StaffModuleController : ControllerBase
{
    private readonly StaffModuleService _service;

    public StaffModuleController(StaffModuleService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    /// <summary>
    /// Get available modules that can be assigned to staff.
    /// </summary>
    [HttpGet("available")]
    public IActionResult GetAvailableModules()
    {
        var modules = _service.GetAvailableModules();
        return Ok(new { availableModules = modules });
    }

    /// <summary>
    /// Get modules currently assigned to a staff member.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetStaffModules(Guid staffId, CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _service.GetStaffModulesAsync(staffId, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    /// <summary>
    /// Assign modules to a staff member.
    /// </summary>
    [HttpPost("assign")]
    public async Task<IActionResult> AssignModules(
        Guid staffId,
        [FromBody] AssignModulesToStaffRequest? request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var result = await _service.AssignModulesToStaffAsync(staffId, request, cancellationToken);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Revoke a module from a staff member.
    /// </summary>
    [HttpDelete("{moduleName}")]
    public async Task<IActionResult> RevokeModule(
        Guid staffId,
        string moduleName,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(moduleName))
            return BadRequest(new { error = "Module name cannot be empty" });

        try
        {
            var result = await _service.RevokeModuleFromStaffAsync(staffId, moduleName, cancellationToken);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}


