using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.BusinessHours;

[ApiController]
[Route("api/saloon/business-hours")]
public class SaloonBusinessHoursController : ControllerBase
{
    private readonly ISaloonBusinessHoursService _service;

    public SaloonBusinessHoursController(ISaloonBusinessHoursService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _service.GetAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] SaloonBusinessHoursUpdateRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
