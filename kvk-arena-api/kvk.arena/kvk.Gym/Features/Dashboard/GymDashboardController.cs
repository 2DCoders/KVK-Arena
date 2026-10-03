using Microsoft.AspNetCore.Mvc;
using kvk.Gym.Interfaces;

namespace kvk.Gym.Features.Dashboard;

[ApiController]
[Route("api/gym/dashboard")]
public class GymDashboardController : ControllerBase
{
    private readonly IGymDashboardService _service;

    public GymDashboardController(IGymDashboardService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken = default)
    {
        var result = await _service.GetDashboardAsync(cancellationToken);
        return Ok(result);
    }
}
