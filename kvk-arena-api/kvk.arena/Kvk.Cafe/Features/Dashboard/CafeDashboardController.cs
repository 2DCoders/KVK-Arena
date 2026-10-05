using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Kvk.Cafe.Interfaces;

namespace Kvk.Cafe.Features.Dashboard;

[Authorize]
[ApiController]
[Route("api/cafe/dashboard")]
public class CafeDashboardController : ControllerBase
{
    private readonly ICafeDashboardService _service;

    public CafeDashboardController(ICafeDashboardService service)
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
