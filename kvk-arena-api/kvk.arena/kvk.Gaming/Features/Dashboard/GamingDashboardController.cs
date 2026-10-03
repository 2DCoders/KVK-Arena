using Microsoft.AspNetCore.Mvc;
using kvk.Gaming.Interfaces;

namespace kvk.Gaming.Features.Dashboard;

[ApiController]
[Route("api/gaming-m/dashboard")]
public class GamingDashboardController : ControllerBase
{
    private readonly IGamingDashboardService _service;

    public GamingDashboardController(IGamingDashboardService service)
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
