using Microsoft.AspNetCore.Mvc;
using kvk.Saloon.Interfaces;

namespace kvk.Saloon.Features.Dashboard;

[ApiController]
[Route("api/saloon/dashboard")]
public class SaloonDashboardController : ControllerBase
{
    private readonly ISaloonDashboardService _service;

    public SaloonDashboardController(ISaloonDashboardService service)
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
