using Microsoft.AspNetCore.Mvc;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Services;
using kvk.Gym.Features.Payments;

namespace kvk.Gym.Features.Payments;

[ApiController]
[Route("api/gym/members/{memberId:guid}/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _service;

    public PaymentsController(IPaymentService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create(Guid memberId, [FromBody] CreatePaymentRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreatePaymentAsync(memberId, request, cancellationToken);
        if (!result.Succeeded)
            return BadRequest(result);

        return CreatedAtAction(null, result);
    }
    
    
}

