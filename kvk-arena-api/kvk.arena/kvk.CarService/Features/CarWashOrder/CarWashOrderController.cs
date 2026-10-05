using Microsoft.AspNetCore.Authorization;
using Humanizer;
using kvk.CarService.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.CarService.Features.CarWashOrder;

[Authorize]
[ApiController]
[Route("api/car-service/wash-order")]
public class CarWashOrderController(ICarWashOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CarWashOrderCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await orderService.CreateCarWashOrderAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }


    [HttpPut]
    public async Task<IActionResult> Update([FromForm] CarWashOrderUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await orderService.UpdateCarWashOrderAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await orderService.DeleteCarWashOrderAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPatch("update-status")]
    public async Task<IActionResult> UpdateStatus(Guid orderId,
        CancellationToken cancellationToken = default)
    {
        var result = await orderService.CompleteTheOrderAsync(orderId, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }


    [HttpGet]
    public async Task<ActionResult<List<CarWashOrderResponse>>> Get([FromQuery] Guid orderId = default,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderService.GetCarWashOrdersAsync(DateTime.Now,cancellationToken);
        return Ok(orders);
    }

    // GET /api/car-service/payments?from=2026-01-01&to=2026-01-31
    [HttpGet("/api/car-service/payments")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime? from, [FromQuery] DateTime? to,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderService.GetCarWashOrdersByDateRangeAsync(from, to, cancellationToken);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CarWashOrderResponse>> GetById(Guid id,
        CancellationToken cancellationToken = default)
    {
        var order = await orderService.GetCarWashOrderByIdAsync(id, cancellationToken);
        return Ok(order);
    }
}