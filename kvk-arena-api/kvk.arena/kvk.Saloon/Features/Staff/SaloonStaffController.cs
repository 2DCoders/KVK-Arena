using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.Staff;

[ApiController]
[Route("api/saloon/staff")]
public class SaloonStaffController : ControllerBase
{
    private readonly ISaloonStaffService _service;

    public SaloonStaffController(ISaloonStaffService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var staff = await _service.GetAllAsync( cancellationToken);
        return Ok(staff);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid saloonId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        // Note: Could add check here that result.SaloonId == saloonId
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaloonStaffCreateRequest request, CancellationToken cancellationToken)
    {

        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid saloonId, Guid id, [FromBody] SaloonStaffUpdateRequest request,
        CancellationToken cancellationToken)
    {
        if (id != request.Id)
            return BadRequest("ID mismatch");

        var result = await _service.UpdateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid saloonId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
