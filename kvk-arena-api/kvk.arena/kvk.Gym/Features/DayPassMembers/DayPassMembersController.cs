using kvk.BuildingBlocks.Auth;
using kvk.Gym.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gym.Features.DayPassMembers;

[ApiController]
[Route("api/gym/day-pass-members")]
public class DayPassMembersController : ControllerBase
{
    private readonly IDayPassMemberService _service;

    public DayPassMembersController(IDayPassMemberService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Gym:DayPassMember:Create")]
    public async Task<IActionResult> Create([FromBody] DayPassMemberCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateAsync(request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetById), new { id = ((dynamic)result.AdditionalData["response"]).Id }, result);
    }

    [HttpPut("{id:guid}")]
    [AuthorizeByPermission("KVK:Gym:DayPassMember:Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] DayPassMemberUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.UpdateAsync(id, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Gym:DayPassMember:View")]
    public async Task<IActionResult> Get(CancellationToken cancellationToken = default)
    {
        var response = await _service.GetAllAsync(cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [AuthorizeByPermission("KVK:Gym:DayPassMember:View")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _service.GetByIdAsync(id, cancellationToken);
        if (response == null)
            return NotFound();

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [AuthorizeByPermission("KVK:Gym:DayPassMember:Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return NoContent();
    }
}
