using kvk.BuildingBlocks.Auth;
using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.Saloon;

[ApiController]
[Route("api/saloon/saloons")]
public class SaloonController : ControllerBase
{
    private readonly ISaloonService _service;

    public SaloonController(ISaloonService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Saloon:Saloon:View")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var saloons = await _service.GetAllAsync(cancellationToken);
        return Ok(saloons);
    }

    [HttpGet("{id:guid}")]
    [AuthorizeByPermission("KVK:Saloon:Saloon:View")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Saloon:Saloon:Create")]
    public async Task<IActionResult> Create([FromBody] SaloonCreateRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [AuthorizeByPermission("KVK:Saloon:Saloon:Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaloonUpdateRequest request,
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
    [AuthorizeByPermission("KVK:Saloon:Saloon:Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
