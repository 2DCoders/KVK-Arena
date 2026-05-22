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
    
    [HttpGet]
    public async Task<IActionResult> GetByMember(Guid memberId, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPaymentsByMembershipIdAsync(memberId, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    // GET /api/gym/payments?from=2026-01-01&to=2026-01-31
    [HttpGet("/api/gym/payments")]
    public async Task<IActionResult> GetByDateRange([FromQuery] DateTime? from, [FromQuery] DateTime? to, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetPaymentsByDateRangeAsync(from, to, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}

