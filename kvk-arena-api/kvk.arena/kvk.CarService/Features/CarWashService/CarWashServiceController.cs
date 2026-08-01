using kvk.CarService.Interfaces;
using kvk.BuildingBlocks.Common;
using Microsoft.AspNetCore.Mvc;

namespace kvk.CarService.Features.CarWashService;

//this is made to create all services for now created this for wash services by hardcoding the service category on service
//Adedax 39(for future reference)
[ApiController]
[Route("api/car-service/wash-service")]
public class CarWashServiceController : ControllerBase
{
    private readonly ICarWashService _carWashService;

    public CarWashServiceController(ICarWashService carWashService)
    {
        _carWashService = carWashService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CarWashCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _carWashService.CreateCarWashServiceAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromForm] CarWashUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _carWashService.UpdateCarWashServiceAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _carWashService.DeleteCarWashServiceAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<CarWashServiceResponse>>> Get([FromQuery] Guid serviceId = default, CancellationToken cancellationToken = default)
    {
        var services = await _carWashService.GetCarWashServiceAsync(serviceId, cancellationToken);
        return Ok(services);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CarWashServiceResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var service = await _carWashService.GetCarWashServiceByIdAsync(id, cancellationToken);
        if (service is null)
        {
            return NotFound();
        }
        return Ok(service);
    }
}