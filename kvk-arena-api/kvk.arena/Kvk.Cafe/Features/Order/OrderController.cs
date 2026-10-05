using Kvk.Cafe.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Kvk.Cafe.Features.Order;

[ApiController]
[Route("api/cafe/order")]
public class OrderController(IOrderService orderService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OrderCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await orderService.CreateOrderAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] OrderUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var result = await orderService.UpdateOrderAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await orderService.DeleteOrderAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderResponse>>> Get(CancellationToken cancellationToken = default)
    {
        var orders = await orderService.GetOrdersAsync(cancellationToken);
        return Ok(orders);
    }

    // GET /api/cafe/payments?from=2026-01-01&to=2026-01-31
    [HttpGet("/api/cafe/payments")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime? from, [FromQuery] DateTime? to,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderService.GetOrdersByDateRangeAsync(from, to, cancellationToken);
        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderResponse>> GetById(Guid id,
        CancellationToken cancellationToken = default)
    {
        var order = await orderService.GetOrderByIdAsync(id, cancellationToken);
        return Ok(order);
    }
}