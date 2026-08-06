using kvk.CarService.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.CarService.Features.PackageService;

[ApiController]
[Route("api/car-service/package")]
public class PackageController(IPackageService packageService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] PackageCreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await packageService.CreatePackageAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromForm] PackageUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await packageService.UpdatePackageAsync(request, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await packageService.DeletePackageAsync(id, cancellationToken);
        if (!result.Succeeded)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<PackageResponse>>> Get([FromQuery] Guid packageId = default, CancellationToken cancellationToken = default)
    {
        var packages = await packageService.GetPackagesAsync(packageId, cancellationToken);
        return Ok(packages);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PackageResponse>> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var package = await packageService.GetPackageByIdAsync(id, cancellationToken);
        if (package is null)
        {
            return NotFound();
        }
        return Ok(package);
    }

    [HttpGet("with-services")]
    public async Task<ActionResult<List<CarWashPackagesResponseWithServices>>> GetPackagesWithServices(
        CancellationToken cancellationToken = default)
    {
        var packagesWithServices = await packageService.GetPackagesWithServicesAsync(cancellationToken);
        return Ok(packagesWithServices);
    }
}
