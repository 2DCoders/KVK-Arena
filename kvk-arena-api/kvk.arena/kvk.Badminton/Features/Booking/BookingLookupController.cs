using System.Text.RegularExpressions;
using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace kvk.Badminton.Features.Booking;

[ApiController]
[AllowAnonymous]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
[Route("api/badminton/booking-lookup")]
public sealed class BookingLookupController(BadmintonDbContext db, BookingLookupCodes codes, ISmsService sms) : ControllerBase
{
    public sealed record CodeRequest(string PhoneNumber);
    public sealed record LookupRequest(string PhoneNumber, Guid ChallengeId, string Code);

    [HttpPost("send-code")]
    public async Task<IActionResult> SendCode(CodeRequest request, CancellationToken ct)
    {
        var phone = NormalizePhone(request.PhoneNumber);
        if (phone is null) return BadRequest(new { message = "Enter a valid Sri Lankan mobile number." });

        var challenge = codes.Issue(phone);
        if (challenge is null) return StatusCode(429, new { message = "Too many code requests. Please wait and try again." });

        try
        {
            var result = await sms.SendSingleMessageAsync(phone, $"Your KVK Arena badminton booking lookup code is {challenge.Value.Code}. It expires in 5 minutes.", ct);
            if (result.Succeeded) return Ok(new { challengeId = challenge.Value.Id });
        }
        catch (HttpRequestException)
        {
            // The request remains rate limited when the SMS provider is unavailable.
        }
        return StatusCode(503, new { message = "We couldn't send a code right now. Please try again later." });
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search(LookupRequest request, CancellationToken ct)
    {
        var phone = NormalizePhone(request.PhoneNumber);
        if (phone is null || request.Code is not { Length: 6 } || !request.Code.All(char.IsAsciiDigit) ||
            !codes.Verify(phone, request.ChallengeId, request.Code))
            return BadRequest(new { message = "The code is invalid or expired. Check the code or request a new one." });

        var international = $"94{phone[1..]}";
        var withoutPrefix = phone[1..];
        var bookings = await db.CourtBookings.AsNoTracking()
            .Where(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Completed ||
                        b.Status == BookingStatus.WalkInPendingPayment || b.Status == BookingStatus.Cancelled)
            .Select(b => new
            {
                Booking = b,
                Phone = b.PhoneNumber.Replace(" ", "").Replace("-", "").Replace("(", "").Replace(")", "").Replace("+", "")
            })
            .Where(row => row.Phone == phone || row.Phone == international || row.Phone == withoutPrefix ||
                          row.Phone == "0094" + withoutPrefix || row.Phone == "940" + withoutPrefix)
            .OrderByDescending(row => row.Booking.BookingDate)
            .ThenBy(row => row.Booking.CourtSlot.StartTime)
            .ThenBy(row => row.Booking.Id)
            .Take(250)
            .Select(row => new
            {
                row.Booking.BookingNumber,
                row.Booking.BookingDate,
                CourtName = row.Booking.Court.Name,
                row.Booking.CourtSlot.StartTime,
                row.Booking.CourtSlot.EndTime,
                row.Booking.BookingAmount,
                Status = row.Booking.Status == BookingStatus.WalkInPendingPayment ? "Pending payment" :
                         row.Booking.Status == BookingStatus.Cancelled ? "Cancelled" :
                         row.Booking.Status == BookingStatus.Completed ? "Completed" : "Confirmed"
            }).ToListAsync(ct);

        return Ok(bookings);
    }

    private static string? NormalizePhone(string? value)
    {
        if (value is null || value.Length > 32 || !Regex.IsMatch(value, @"\A[+0-9 ()-]+\z")) return null;
        var digits = Regex.Replace(value, "[^0-9]", "");
        if (digits.StartsWith("0094")) digits = digits[4..];
        else if (digits.StartsWith("94")) digits = digits[2..];
        if (digits.Length == 9) digits = "0" + digits;
        return Regex.IsMatch(digits, @"\A07[0-9]{8}\z") ? digits : null;
    }
}
