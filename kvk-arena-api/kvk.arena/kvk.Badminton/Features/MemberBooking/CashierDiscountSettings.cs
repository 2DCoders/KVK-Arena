using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.Extensions.Configuration;

namespace kvk.Badminton.Features.MemberBooking;

public sealed record CashierDiscountSettings(Guid? CouponCodeId, DateOnly? PromotionStartDate,
    DateOnly? PromotionEndDate, decimal PromotionPercentage, int PromotionMaximumSlots)
{
    public static CashierDiscountSettings Load(IConfiguration configuration)
    {
        var path = Environment.GetEnvironmentVariable("KVK_BADMINTON_ENV_JS");
        if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
            return Parse(File.ReadAllText(path));

        var settings = configuration.GetSection("MemberBadmintonBooking:CashierDiscounts");
        return Create(settings["CouponCodeId"], settings["PromotionStartDate"], settings["PromotionEndDate"],
            settings.GetValue<decimal>("PromotionPercentage"), settings.GetValue<int>("PromotionMaximumSlots"));
    }

    public static CashierDiscountSettings Parse(string source)
    {
        var block = Regex.Match(source, @"^[ 	]*SPECIAL_BOOKING_DISCOUNTS[ 	]*:[ 	]*({[^{}]*})[ 	]*,?[ 	]*?$",
            RegexOptions.Multiline);
        if (!block.Success) throw new InvalidOperationException("Special Bookings discount settings are missing from env.js.");
        try
        {
            using var document = JsonDocument.Parse(block.Groups[1].Value);
            var settings = document.RootElement;
            return Create(settings.GetProperty("couponCodeId").GetString(),
                settings.GetProperty("promotionStartDate").GetString(), settings.GetProperty("promotionEndDate").GetString(),
                settings.GetProperty("promotionPercentage").GetDecimal(), settings.GetProperty("promotionMaximumSlots").GetInt32());
        }
        catch (Exception ex) when (ex is JsonException or FormatException or KeyNotFoundException or InvalidOperationException)
        {
            throw new InvalidOperationException("Special Bookings discount settings in env.js are invalid.", ex);
        }
    }

    private static CashierDiscountSettings Create(string? couponId, string? startDate, string? endDate, decimal percentage, int maxSlots)
    {
        var start = ParseDate(startDate);
        var end = ParseDate(endDate);
        if (percentage is < 0 or > 100 || maxSlots < -1 || start.HasValue != end.HasValue ||
            (start.HasValue && end < start) || (percentage > 0 && start is null))
            throw new FormatException("Special Bookings discount settings are invalid.");
        return new(string.IsNullOrWhiteSpace(couponId) ? null : Guid.Parse(couponId), start, end, percentage, maxSlots);
    }

    private static DateOnly? ParseDate(string? value) => string.IsNullOrWhiteSpace(value) ? null :
        DateOnly.ParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture);

    internal CashierPricing Price(IReadOnlyList<decimal> prices, DateOnly today)
    {
        var count = PromotionPercentage > 0 && today >= PromotionStartDate && today <= PromotionEndDate
            ? PromotionMaximumSlots == -1 ? prices.Count : Math.Min(PromotionMaximumSlots, prices.Count)
            : 0;
        var discount = ReservationCouponPricing.Discount(prices, PromotionPercentage, count);
        var amounts = CashierPricing.ApplyDiscount(prices, count, discount);
        return new(prices.Sum(), discount, count, count > 0 ? PromotionPercentage : 0, 0, 0, amounts);
    }

    internal CashierCouponLimit CouponLimit => new(CouponCodeId);
}

internal sealed record CashierPricing(decimal OriginalAmount, decimal PromotionDiscount, int PromotionSlotCount,
    decimal PromotionPercentage, decimal CouponDiscount, int CouponSlotCount, decimal[] Amounts)
{
    public decimal FinalAmount => OriginalAmount - PromotionDiscount - CouponDiscount;
    public bool IsPromotion => PromotionSlotCount > 0;
    public object Summary => new { OriginalAmount, PromotionDiscount, PromotionSlotCount, PromotionPercentage,
        CouponDiscount, CouponSlotCount, FinalAmount, IsPromotion };

    public CashierPricing WithCoupon(CouponValidationResult coupon) => this with
    {
        CouponDiscount = coupon.DiscountAmount,
        CouponSlotCount = coupon.DiscountedSlotCount,
        Amounts = ApplyDiscount(Amounts, coupon.DiscountedSlotCount, coupon.DiscountAmount)
    };

    internal static decimal[] ApplyDiscount(IReadOnlyList<decimal> prices, int slotCount, decimal discount) =>
        discount == 0 ? prices.ToArray() :
            MemberSchedule.Amounts(prices.Take(slotCount).ToArray(), discount).Concat(prices.Skip(slotCount)).ToArray();
}
