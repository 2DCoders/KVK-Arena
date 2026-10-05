using Microsoft.AspNetCore.Mvc;
using kvk.CarService.Interfaces;

namespace kvk.CarService.Features.Dashboard;

[ApiController]
[Route("api/car-service/dashboard")]
public class CarWashDashboardController : ControllerBase
{
    private readonly ICarWashDashboardService _service;

    public CarWashDashboardController(ICarWashDashboardService service)
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
