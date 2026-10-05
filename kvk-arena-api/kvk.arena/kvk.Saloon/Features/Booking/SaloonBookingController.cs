using Microsoft.AspNetCore.Authorization;
using kvk.Saloon.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Saloon.Features.Booking;

[Authorize]
[ApiController]
[Route("api/saloon/saloons/bookings")]
public class SaloonBookingController : ControllerBase
{
    private readonly ISaloonBookingService _service;

    public SaloonBookingController(ISaloonBookingService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] GetSaloonBookingsListRequest request, CancellationToken cancellationToken)
    {
        var bookings = await _service.GetBookingsListAsync(request, cancellationToken);
        return Ok(bookings);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);
        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("~/api/saloon/bookings")]
    public async Task<IActionResult> Create([FromBody] SaloonBookingCreateRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("~/api/saloon/bookings/create-with-payment")]
    public async Task<IActionResult> CreateWithPayment([FromBody] SaloonBookingCreateRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CreateWithPaymentAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpPost("~/api/saloon/bookings/notify")]
    public async Task<IActionResult> PaymentNotification([FromForm] kvk.BuildingBlocks.Common.PaymentNotificationRequest request, CancellationToken cancellationToken)
    {
        await _service.VerifyPaymentNotificationAsync(request, cancellationToken);
        return Ok();
    }

    [AllowAnonymous]
    [HttpPost("~/api/saloon/bookings/reverse")]
    public async Task<IActionResult> ReversePendingPayment([FromBody] SaloonPendingPaymentDeleteRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.DeletePendingPayment(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("~/api/saloon/bookings/availability")]
    public async Task<IActionResult> CheckAvailability([FromQuery] SaloonBookingAvailabilityRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CheckAvailabilityAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [AllowAnonymous]
    [HttpGet("~/api/saloon/bookings/day-availability")]
    public async Task<IActionResult> CheckDayAvailability([FromQuery] SaloonDayAvailabilityRequest request, CancellationToken cancellationToken)
    {
        var result = await _service.CheckDayAvailabilityAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaloonBookingUpdateRequest request,
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
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DeleteAsync(id, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
