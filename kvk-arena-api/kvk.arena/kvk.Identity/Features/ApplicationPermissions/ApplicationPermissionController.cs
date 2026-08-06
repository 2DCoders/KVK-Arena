using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.ApplicationPermissions;

[ApiController]
[Route("api/identity-m/application-permissions")]
public class ApplicationPermissionController(ApplicationPermissionService service) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateApplicationPermission(
        [FromBody] ApplicationPermissionRequest request, CancellationToken cancellationToken)
    {
        return Ok( await service.CreateApplicationPermission(request, cancellationToken));
    }

    [HttpGet]
    public async Task<IActionResult> GetApplicationPermission(CancellationToken cancellationToken)
    {
        var result = await service.GetApplicationPermissions(cancellationToken);
        return Ok(result);
    }
}