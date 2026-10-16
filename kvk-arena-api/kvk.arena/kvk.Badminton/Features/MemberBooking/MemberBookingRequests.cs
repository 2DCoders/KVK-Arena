using System.ComponentModel.DataAnnotations;
using kvk.Badminton.Features.CourtBookingTemporary;
using kvk.Badminton.Features.Booking;

namespace kvk.Badminton.Features.MemberBooking;

public class MemberScheduleRequest
{
    public DateOnly StartDate { get; set; }
    [Range(1, 52)] public int Weeks { get; set; }
    [MinLength(1), MaxLength(7)] public List<DaysOfWeek> DaysOfWeek { get; set; } = [];
    [MinLength(1), MaxLength(48)] public List<Guid> SlotIds { get; set; } = [];
}
public class CashierAvailabilityRequest
{
    public DateOnly StartDate { get; set; }
    [Range(1, 52)] public int Weeks { get; set; }
    [MinLength(1), MaxLength(7)] public List<DaysOfWeek> DaysOfWeek { get; set; } = [];
}
public class MemberCouponRequest
{
    public Guid HoldToken { get; set; }
    [Required, MaxLength(100)] public string CouponCode { get; set; } = "";
}
public class MemberReverseRequest
{
    public Guid HoldToken { get; set; }
    public string? OrderId { get; set; }
}
public class MemberConfirmRequest : MemberCouponRequest
{
    [Required, MaxLength(100)] public string CustomerName { get; set; } = "";
    [Required, RegularExpression(@"^\+?[0-9]{9,15}$")] public string PhoneNumber { get; set; } = "";
    [Required, EmailAddress, MaxLength(254)] public string Email { get; set; } = "";
}
public class CashierMemberConfirmRequest : MemberCouponRequest
{
    [Required, MaxLength(100)] public string CustomerName { get; set; } = "";
    [Required, RegularExpression(@"^\+?[0-9]{9,15}$")] public string PhoneNumber { get; set; } = "";
    [Range(1, 2)] public int PaymentType { get; set; }
}
public static class MemberSchedule
{
    public static decimal[] Amounts(IReadOnlyList<decimal> prices, decimal discount)
    {
        var original = prices.Sum();
        if (prices.Any(price => price < 0) || discount < 0 || discount > original)
            throw new InvalidOperationException("Invalid booking prices or coupon discount.");
        var final = original - discount;
        var remaining = final;
        return prices.Select((price, index) =>
        {
            var amount = index == prices.Count - 1 ? remaining : original == 0 ? 0 :
                Math.Min(remaining, decimal.Round(final * price / original, 2, MidpointRounding.AwayFromZero));
            remaining -= amount;
            return amount;
        }).ToArray();
    }

    public static DateOnly EndDate(DateOnly start, int weeks) => start.AddDays(checked(weeks * 7 - 1));
    public static List<DateOnly> Dates(DateOnly start, int weeks, IEnumerable<DaysOfWeek> weekdays)
    {
        if (weeks < 1 || weeks > 52) throw new InvalidOperationException("Choose a valid duration.");
        var days = weekdays.Select(day => Enum.Parse<DayOfWeek>(day.ToString())).ToHashSet();
        return Enumerable.Range(0, weeks * 7).Select(start.AddDays).Where(date => days.Contains(date.DayOfWeek)).ToList();
    }
}
