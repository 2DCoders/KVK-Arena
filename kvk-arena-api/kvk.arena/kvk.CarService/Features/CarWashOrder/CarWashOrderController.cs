using kvk.CarService.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.CarService.Features.CarWashOrder;

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
    
    
    [HttpGet]
    public async Task<ActionResult<List<CarWashOrderResponse>>> Get([FromQuery] Guid orderId = default,
        CancellationToken cancellationToken = default)
    {
        var orders = await orderService.GetCarWashOrdersAsync(cancellationToken);
        return Ok(orders);
    }
    
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CarWashOrderResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var order = await orderService.GetCarWashOrderByIdAsync(id, cancellationToken);
        return Ok(order);
    }
}