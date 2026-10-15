using System.Text.RegularExpressions;
using kvk.Badminton.Features.CourtBookingTemporary;
using kvk.Badminton.Interfaces;
using kvk.BuildingBlocks.Enums;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace kvk.Badminton.Features.MemberBooking;

// Dedicated member-link endpoints. Cashier endpoints retain their authorization.
[ApiController]
[Route("api/member-badminton-bookings")]
public class MemberBadmintonBookingController : ControllerBase
{
    private readonly CourtBookingTemporaryService _bookings;
    private readonly ICourtSlotConfigurationService _slots;
    private readonly ICouponValidationService _members;

    public MemberBadmintonBookingController(CourtBookingTemporaryService bookings,
        ICourtSlotConfigurationService slots, ICouponValidationService members)
    {
        _bookings = bookings;
        _slots = slots;
        _members = members;
    }

    [HttpGet("courts/{courtId:guid}/slots")]
    public async Task<IActionResult> GetSlots(Guid courtId, CancellationToken cancellationToken)
    {
        return Ok(await _slots.GetSlotsByCourtIdAsync(courtId, cancellationToken));
    }

    [HttpPost("check-availability")]
    public async Task<IActionResult> CheckAvailability(
        [FromBody] CourtBookingTemporaryAvailabilityCheckRequest request,
        [FromQuery] string memberId, [FromQuery] string? couponCode,
        CancellationToken cancellationToken)
    {
        var validation = await ValidateAsync(request, memberId, cancellationToken);
        if (validation is not null) return BadRequest(new { Message = validation });
        try
        {
            return Ok(await _bookings.CheckAvailabilityAsync(request, memberId.Trim(), couponCode?.Trim().ToUpperInvariant()));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromForm] CreateCourtBookingTemporaryRequest request,
        CancellationToken cancellationToken)
    {
        var schedule = new CourtBookingTemporaryAvailabilityCheckRequest
        {
            CourtId = request.CourtId, StartDate = request.StartDate,
            NumberOfSlots = request.NumberOfSlots, SlotIds = request.SlotIds, DaysOfWeek = request.DaysOfWeek
        };
        var validation = await ValidateAsync(schedule, request.MemberId, cancellationToken);
        if (validation is not null) return BadRequest(new { Message = validation });
        if (request.PaymentType is not (PaymentType.Cash or PaymentType.CreditCard))
            return BadRequest(new { Message = "Choose cash or card as your payment method." });

        request.MemberId = request.MemberId.Trim();
        request.CouponCode = request.CouponCode?.Trim().ToUpperInvariant();
        try
        {
            // The existing service rechecks availability and computes the final amount server-side.
            var result = await _bookings.CreateBookingAsync(request, cancellationToken);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }

    private async Task<string?> ValidateAsync(CourtBookingTemporaryAvailabilityCheckRequest request,
        string? memberId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(memberId) || !Regex.IsMatch(memberId.Trim(), @"^KVK-MEM-2026\d{4}$"))
            return "Enter a valid registered KVK member ID.";
        if (request.CourtId == Guid.Empty || request.StartDate == default || request.NumberOfSlots < 1 ||
            request.NumberOfSlots > (DateTime.MaxValue - request.StartDate).TotalDays / 7 ||
            request.SlotIds is not { Count: > 0 } || request.DaysOfWeek is not { Count: > 0 })
            return "Choose a court, a valid start date, duration, days and time slots.";
        if (request.DaysOfWeek.Any(day => !Enum.IsDefined(day)) ||
            request.DaysOfWeek.Distinct().Count() != request.DaysOfWeek.Count ||
            request.SlotIds.Distinct().Count() != request.SlotIds.Count)
            return "Choose valid days and time slots without duplicates.";

        var courtSlots = await _slots.GetSlotsByCourtIdAsync(request.CourtId, cancellationToken);
        var selected = courtSlots.Where(slot => request.SlotIds.Contains(slot.SlotId)).OrderBy(slot => slot.StartTime).ToList();
        if (selected.Count != request.SlotIds.Count)
            return "One or more selected time slots do not belong to this court.";
        for (var index = 1; index < selected.Count; index++)
            if (selected[index - 1].EndTime != selected[index].StartTime)
                return "Choose consecutive time slots without gaps.";

        try
        {
            if (await _members.GetMemberIdAsync(memberId.Trim()) == Guid.Empty)
                return "This member ID could not be verified. Please check your membership details.";
        }
        catch (Exception ex) when (ex.Message.StartsWith("Member with MemberId", StringComparison.Ordinal))
        {
            return "This member ID could not be verified. Please check your membership details.";
        }
        return null;
    }
}
