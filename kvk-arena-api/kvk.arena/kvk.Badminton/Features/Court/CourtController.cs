using kvk.BuildingBlocks.Auth;
using kvk.Badminton.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Badminton.Features.Court;

[ApiController]
[Route("api/badminton/courts")]
public class CourtController : ControllerBase
{
    private readonly ICourtService _service;

    public CourtController(ICourtService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Badminton:Court:View")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var courts = await _service.GetAllAsync(cancellationToken);
        return Ok(courts);
    }

    [HttpGet("{id:guid}")]
    [AuthorizeByPermission("KVK:Badminton:Court:View")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Badminton:Court:Create")]
    public async Task<IActionResult> Create([FromBody] CourtCreateRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [AuthorizeByPermission("KVK:Badminton:Court:Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] CourtUpdateRequest request,
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
    [AuthorizeByPermission("KVK:Badminton:Court:Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
