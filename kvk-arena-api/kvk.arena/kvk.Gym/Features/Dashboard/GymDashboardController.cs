using kvk.BuildingBlocks.Auth;
using Microsoft.AspNetCore.Mvc;
using kvk.Gym.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace kvk.Gym.Features.Dashboard;

[ApiController]
[Route("api/gym/dashboard")]
[Authorize]
public class GymDashboardController : ControllerBase
{
    private readonly IGymDashboardService _service;

    public GymDashboardController(IGymDashboardService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Gym:Dashboard:View")]
    public async Task<IActionResult> Get(CancellationToken cancellationToken = default)
    {
        var result = await _service.GetDashboardAsync(cancellationToken);
        return Ok(result);
    }
}
