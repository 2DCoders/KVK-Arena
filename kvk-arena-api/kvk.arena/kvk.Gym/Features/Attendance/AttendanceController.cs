using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Services;
using kvk.Gym.Features.Attendance;

namespace kvk.Gym.Features.Attendance;

[ApiController]
[Route("api/gym/attendance")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;

    public AttendanceController(IAttendanceService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost("/scan")]
    public async Task<IActionResult> Scan([FromBody] RecordScanRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.RecordScanAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}

