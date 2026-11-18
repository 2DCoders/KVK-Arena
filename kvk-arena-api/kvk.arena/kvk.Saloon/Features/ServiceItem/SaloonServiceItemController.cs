using kvk.BuildingBlocks.Auth;
using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.ServiceItem;

[ApiController]
[Route("api/saloon/service-items")]
public class SaloonServiceItemController : ControllerBase
{
    private readonly ISaloonServiceItemService _service;

    public SaloonServiceItemController(ISaloonServiceItemService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Saloon:ServiceItem:View")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var serviceItems = await _service.GetAllAsync(cancellationToken);
        return Ok(serviceItems);
    }

    [HttpGet("{id:guid}")]
    [AuthorizeByPermission("KVK:Saloon:ServiceItem:View")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Saloon:ServiceItem:Create")]
    public async Task<IActionResult> Create([FromForm] SaloonServiceItemCreateRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [AuthorizeByPermission("KVK:Saloon:ServiceItem:Edit")]
    public async Task<IActionResult> Update(Guid id, [FromForm] SaloonServiceItemUpdateRequest request,
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
    [AuthorizeByPermission("KVK:Saloon:ServiceItem:Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
