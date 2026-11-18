using kvk.BuildingBlocks.Auth;
using kvk.Badminton.Interfaces;
using kvk.BuildingBlocks.Common;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Badminton.Features.Booking;

[ApiController]
[Route("api/badminton/bookings")]
public class BookingController : ControllerBase
{
    private readonly IBookingService _service;

    public BookingController(IBookingService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost("hold")]
    [AuthorizeByPermission("KVK:Badminton:BookingHold:Create")]
    public async Task<IActionResult> CreateHold([FromBody] BookingHoldRequest request, CancellationToken ct)
    {
        var result = await _service.CreateHoldAsync(request, ct);
        
        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("confirm/{holdId:guid}")]
    [AuthorizeByPermission("KVK:Badminton:BookingPayment:Edit")]
    public async Task<IActionResult> Confirm(Guid holdId,[FromBody] CustomerDetails customerDetails, [FromQuery] string? paymentIntentId, CancellationToken ct)
    {
        var result = await _service.ProcessPaymentSuccessAsync(holdId,customerDetails, paymentIntentId, ct);

        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found")) return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("multi-hold")]
    [AuthorizeByPermission("KVK:Badminton:BookingHold:Create")]
    public async Task<IActionResult> CreateMultiHold([FromBody] MultiBookingRequest request, CancellationToken ct)
    {
        var result = await _service.CreateMultiHoldAsync(request, ct);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("confirm-multi")]
    [AuthorizeByPermission("KVK:Badminton:BookingPayment:Edit")]
    public async Task<IActionResult> ConfirmMulti([FromBody] MultiPaymentRequest request, CancellationToken ct)
    {
        var result = await _service.ProcessMultiPaymentSuccessAsync(request, ct);

        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found")) return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("create")] // New endpoint for single booking with payment
    [AuthorizeByPermission("KVK:Badminton:Booking:Create")]
    public async Task<IActionResult> CreateSingleBookingWithPayment([FromBody] SingleBookingWithPaymentRequest request, CancellationToken ct)
    {
        var result = await _service.CreateSingleBookingWithPaymentAsync(request, ct);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("create-multi")] // Initiates PayHere payment for an existing batch of holds (from multi-hold)
    [AuthorizeByPermission("KVK:Badminton:BookingPayment:Create")]
    public async Task<IActionResult> CreateMultiPayment([FromBody] MultiBookingPaymentRequest request, CancellationToken ct)
    {
        var result = await _service.CreateMultiPaymentAsync(request, ct);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("notify")]
    public async Task<IActionResult> PaymentNotification([FromForm] PaymentNotificationRequest request, CancellationToken ct)
    {
        await _service.VerifyPaymentNotificationAsync(request, ct);
        return Ok();
    }

    [HttpPost("internal/cleanup")]
    [AuthorizeByPermission("KVK:Badminton:BookingMaintenance:Manage")]
    public async Task<IActionResult> Cleanup(CancellationToken ct)
    {
        var result = await _service.CleanupExpiredHoldsAsync(ct);
        return Ok(result);
    }

    [HttpPost("internal/fix-stale-pending")]
    [AuthorizeByPermission("KVK:Badminton:BookingMaintenance:Manage")]
    public async Task<IActionResult> FixStalePendingBookings(CancellationToken ct)
    {
        var result = await _service.FixStalePendingBookingsAsync(ct);
        return Ok(result);
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Badminton:Booking:View")]
    public async Task<ActionResult<List<BookingListResponse>>> GetBookingsList([FromQuery] GetBookingsListRequest request, CancellationToken ct = default)
    {
        var result = await _service.GetBookingsListAsync(request, ct);
        return Ok(result);
    }

    [HttpPost("reverse")]
    [AuthorizeByPermission("KVK:Badminton:BookingPayment:Delete")]
    public async Task<IActionResult> ReversePendingPayment([FromBody] BadmintonPendingPaymentDeleteRequest request, CancellationToken ct)
    {
        var result = await _service.DeletePendingPayment(request, ct);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
