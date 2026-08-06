using kvk.BuildingBlocks.Auth;
using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace kvk.Gym.Features.DayEnd;

[ApiController]
[Route("api/gym/dayend")]
[Authorize]
public class DayEndController : ControllerBase
{
    private readonly IDayEndService _service;

    public DayEndController(IDayEndService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Gym:DayEnd:Create")]
    public async Task<IActionResult> Create([FromBody] kvk.BuildingBlocks.Common.DayEnd request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateDayEndAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    // GET /api/gym/dayend?date=2026-05-24
    [HttpGet]
    [AuthorizeByPermission("KVK:Gym:DayEnd:View")]
    public async Task<IActionResult> Get([FromQuery] DateTime? date, CancellationToken cancellationToken = default)
    {
        var list = await _service.GetDayEndsAsync(date, cancellationToken);
        return Ok(list);
    }
}
