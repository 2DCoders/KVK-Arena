using kvk.BuildingBlocks.Auth;
using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.StaffSchedule;

[ApiController]
[Route("api/saloon/staff/{staffId:guid}/schedules")]
public class SaloonStaffScheduleController : ControllerBase
{
    private readonly ISaloonStaffScheduleService _service;

    public SaloonStaffScheduleController(ISaloonStaffScheduleService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Saloon:StaffSchedule:View")]
    public async Task<IActionResult> GetAll(Guid staffId, CancellationToken cancellationToken)
    {
        var schedules = await _service.GetAllAsync(staffId, cancellationToken);
        return Ok(schedules);
    }

    [HttpGet("{id:guid}")]
    [AuthorizeByPermission("KVK:Saloon:StaffSchedule:View")]
    public async Task<IActionResult> GetById(Guid staffId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Saloon:StaffSchedule:Create")]
    public async Task<IActionResult> Create(Guid staffId, [FromBody] SaloonStaffScheduleCreateRequest request, CancellationToken cancellationToken)
    {
        if (request.SaloonStaffId != staffId)
            return BadRequest("StaffId mismatch");

        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [AuthorizeByPermission("KVK:Saloon:StaffSchedule:Edit")]
    public async Task<IActionResult> Update(Guid staffId, Guid id, [FromBody] SaloonStaffScheduleUpdateRequest request,
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
    [AuthorizeByPermission("KVK:Saloon:StaffSchedule:Delete")]
    public async Task<IActionResult> Delete(Guid staffId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
