using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.ServiceItem;

[ApiController]
[Route("api/saloon/saloons/{saloonId:guid}/service-items")]
public class SaloonServiceItemController : ControllerBase
{
    private readonly ISaloonServiceItemService _service;

    public SaloonServiceItemController(ISaloonServiceItemService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(Guid saloonId, CancellationToken cancellationToken)
    {
        var serviceItems = await _service.GetAllAsync(saloonId, cancellationToken);
        return Ok(serviceItems);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid saloonId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid saloonId, [FromBody] SaloonServiceItemCreateRequest request, CancellationToken cancellationToken)
    {
        if (request.SaloonId != saloonId)
            return BadRequest("SaloonId mismatch");

        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid saloonId, Guid id, [FromBody] SaloonServiceItemUpdateRequest request,
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
