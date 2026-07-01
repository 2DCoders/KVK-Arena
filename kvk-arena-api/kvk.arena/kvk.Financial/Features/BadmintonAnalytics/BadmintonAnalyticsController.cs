using kvk.BuildingBlocks.Common;
using kvk.Financial.Features.BadmintonAnayltics;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Financial.Features.BadmintonAnalytics;
[ApiController]
[Route("api/financial/badminton-analytics")]
public class BadmintonAnalyticsController : ControllerBase
{
    private readonly BadmintonAnalyticsService _service;

    public BadmintonAnalyticsController(BadmintonAnalyticsService service)
    {
        _service = service;
    }
    
    
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] BadmintonAnalyticsRequest request, CancellationToken cancellationToken = default)
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