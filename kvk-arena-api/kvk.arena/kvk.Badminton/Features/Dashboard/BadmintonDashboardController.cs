using Microsoft.AspNetCore.Mvc;
using kvk.Badminton.Interfaces;

namespace kvk.Badminton.Features.Dashboard;

[ApiController]
[Route("api/badminton/dashboard")]
public class BadmintonDashboardController : ControllerBase
{
    private readonly IBadmintonDashboardService _service;

    public BadmintonDashboardController(IBadmintonDashboardService service)
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
