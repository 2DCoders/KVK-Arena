using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.Gym.Features.DayEnd;

[ApiController]
[Route("api/gym/dayend")]
public class DayEndController : ControllerBase
{
    private readonly IDayEndService _service;

    public DayEndController(IDayEndService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] kvk.BuildingBlocks.Common.DayEnd request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateDayEndAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    // GET /api/gym/dayend?date=2026-05-24
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime? date, CancellationToken cancellationToken = default)
    {
        var list = await _service.GetDayEndsAsync(date, cancellationToken);
        return Ok(list);
    }
}
