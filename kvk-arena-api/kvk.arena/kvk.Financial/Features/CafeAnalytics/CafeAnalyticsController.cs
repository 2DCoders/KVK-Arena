using kvk.BuildingBlocks.Common;
using kvk.Financial.Features.CafeAnalytics;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Financial.Features.CarserviceAnalytics;
[ApiController]
[Route("api/financial/cafe-analytics")]
public class CafeAnalyticsController : ControllerBase
{
    private readonly CafeAnalyticsService _service;

    public CafeAnalyticsController(CafeAnalyticsService service)
    {
        _service = service;
    }
    
    
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] CafeAnalyticsRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return BadRequest(Result.Failure("Request cannot be null"));

        if (!ModelState.IsValid)
            return BadRequest(Result.Failure(string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))));

        // Parse dates in expected format yyyy-MM-dd
        const string format = "yyyy-MM-dd";
        if (!DateTime.TryParseExact(request.StartDate, format, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var start))
            return BadRequest(Result.Failure($"StartDate must be in format {format} (e.g. 2026-05-21)"));

        if (!DateTime.TryParseExact(request.EndDate, format, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out var end))
            return BadRequest(Result.Failure($"EndDate must be in format {format} (e.g. 2026-05-21)"));

        var result = await _service.GetAsync(start.Date, end.Date, cancellationToken);

        return Ok(result);
    }
}