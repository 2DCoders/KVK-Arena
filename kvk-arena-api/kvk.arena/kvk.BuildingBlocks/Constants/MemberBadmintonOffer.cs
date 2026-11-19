using Microsoft.Extensions.Configuration;

namespace kvk.BuildingBlocks.Constants;

public sealed record MemberBadmintonOffer(DateOnly StartDate, int Days)
{
    public const string ExpiredMessage = "This registered-member booking offer has ended.";
    public DateOnly LastDay => StartDate.AddDays(Days - 1);

    public static MemberBadmintonOffer FromConfiguration(IConfiguration configuration) =>
        new(
            configuration.GetValue<DateOnly>("MemberBadmintonBooking:OfferStartDate"),
            Math.Clamp(configuration.GetValue<int>("MemberBadmintonBooking:OfferDays"), 1, 365));

    public bool IsExpired(DateTime utcNow) =>
        DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(utcNow, TimeZoneInfo.FindSystemTimeZoneById("Asia/Colombo"))) > LastDay;
}
