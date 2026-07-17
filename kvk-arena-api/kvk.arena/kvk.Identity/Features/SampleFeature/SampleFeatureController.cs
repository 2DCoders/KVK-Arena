using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.SampleFeature;

[ApiController]
[Route("api/health-check")]
public class SampleFeatureController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "Healthy", timestamp = DateTime.UtcNow });
    }
}
