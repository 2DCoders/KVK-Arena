using kvk.BuildingBlocks.Auth;
using kvk.BuildingBlocks.Common;
using kvk.Gaming.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Gaming.Features.GamingBooking;

[ApiController]
[Route("api/gaming-m/gaming-bookings")]
public class GamingBookingController : ControllerBase
{
    private readonly IGamingBookingService _service;

    public GamingBookingController(IGamingBookingService service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    [AuthorizeByPermission("KVK:Gaming:Booking:Create")]
    public async Task<IActionResult> CreateGamingBooking([FromBody] CreateGamingBookingRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateGamingBookingAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("multi-hold")]
    [AuthorizeByPermission("KVK:Gaming:BookingHold:Create")]
    public async Task<IActionResult> CreateMultiGamingHold([FromBody] MultiGamingBookingRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateMultiGamingHoldAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("create-with-payment")]
    [AuthorizeByPermission("KVK:Gaming:Booking:Create")]
    public async Task<IActionResult> CreateSingleGamingBookingWithPayment([FromBody] SingleGamingBookingWithPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateSingleGamingBookingWithPaymentAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("create-multi-payment")] // Initiates PayHere payment for an existing batch of holds (from multi-hold)
    [AuthorizeByPermission("KVK:Gaming:BookingPayment:Create")]
    public async Task<IActionResult> CreateMultiGamingPayment([FromBody] MultiGamingBookingPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateMultiGamingPaymentAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpPost("confirm/{holdId:guid}")]
    [AuthorizeByPermission("KVK:Gaming:BookingPayment:Edit")]
    public async Task<IActionResult> ConfirmGamingBooking(Guid holdId, [FromQuery] string paymentIntentId, CancellationToken cancellationToken = default)
    {
        var result = await _service.ProcessPaymentSuccessAsync(holdId, paymentIntentId, cancellationToken);

        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found")) return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("confirm-multi")]
    [AuthorizeByPermission("KVK:Gaming:BookingPayment:Edit")]
    public async Task<IActionResult> ConfirmMulti([FromBody] MultiGamingPaymentRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.ProcessMultiPaymentSuccessAsync(request, cancellationToken);

        if (!result.Succeeded)
        {
            if (result.Message.Contains("not found")) return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("notify")]
    public async Task<IActionResult> GamingPaymentNotification([FromForm] PaymentNotificationRequest request, CancellationToken cancellationToken = default)
    {
        await _service.VerifyPaymentNotificationAsync(request, cancellationToken);
        return Ok();
    }

    [HttpPut("cancel")]
    [AuthorizeByPermission("KVK:Gaming:Booking:Delete")]
    public async Task<IActionResult> CancelGamingBooking([FromBody] CancelGamingBookingRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CancelGamingBookingAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [AuthorizeByPermission("KVK:Gaming:Booking:View")]
    public async Task<ActionResult<GamingBookingResponse>> GetGamingBookingById(Guid id, CancellationToken cancellationToken = default)
    {
        var response = await _service.GetGamingBookingByIdAsync(id, cancellationToken);

        if (response == null)
            return NotFound();

        return Ok(response);
    }

    [HttpGet]
    [AuthorizeByPermission("KVK:Gaming:Booking:View")]
    public async Task<ActionResult<List<GamingBookingResponse>>> GetGamingBookingsList([FromQuery] GetGamingBookingsListRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetGamingBookingsListAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("by-station")]
    [AuthorizeByPermission("KVK:Gaming:Booking:View")]
    public async Task<ActionResult<List<GamingBookingResponse>>> GetBookingsByGamingStation([FromQuery] GetBookingsByGamingStationRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetBookingsByGamingStationAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpGet("by-customer")]
    [AuthorizeByPermission("KVK:Gaming:Booking:View")]
    public async Task<ActionResult<List<GamingBookingResponse>>> GetBookingsByCustomer([FromQuery] GetBookingsByCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetBookingsByCustomerAsync(request, cancellationToken);
        return Ok(result);
    }

    [HttpPost("internal/fix-stale-pending")]
    [AuthorizeByPermission("KVK:Gaming:BookingMaintenance:Manage")]
    public async Task<IActionResult> FixStalePendingBookings(CancellationToken cancellationToken = default)
    {
        var result = await _service.FixStalePendingBookingsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpPost("reverse")]
    [AuthorizeByPermission("KVK:Gaming:BookingPayment:Delete")]
    public async Task<IActionResult> ReversePendingPayment([FromBody] GamingPendingPaymentDeleteRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.DeletePendingPayment(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }
}
