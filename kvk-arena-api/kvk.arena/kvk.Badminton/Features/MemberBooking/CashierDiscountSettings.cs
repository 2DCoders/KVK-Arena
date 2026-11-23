using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.Badminton.Features.MemberBooking;

public sealed record CashierDiscountSettings(Guid? CouponCodeId, DateOnly? PromotionStartDate,
    DateOnly? PromotionEndDate, decimal PromotionPercentage, int PromotionMaximumSlots)
{
    public static CashierDiscountSettings Load()
    {
        var path = Environment.GetEnvironmentVariable("KVK_BADMINTON_ENV_JS");
        if (string.IsNullOrWhiteSpace(path))
        {
            for (DirectoryInfo? directory = new(AppContext.BaseDirectory); directory is not null; directory = directory.Parent)
            {
                var candidate = Path.Combine(directory.FullName, "KVK-Badminton", "kvk-badminton-billing", "public", "env.js");
                if (!File.Exists(candidate)) continue;
                path = candidate;
                break;
            }
        }
        if (path is null || !File.Exists(path))
            throw new InvalidOperationException("Special Bookings pricing is unavailable. Configure KVK_BADMINTON_ENV_JS on the API host.");
        return Parse(File.ReadAllText(path));
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
            var couponId = settings.GetProperty("couponCodeId").GetString();
            var start = ParseDate(settings.GetProperty("promotionStartDate").GetString());
            var end = ParseDate(settings.GetProperty("promotionEndDate").GetString());
            var percentage = settings.GetProperty("promotionPercentage").GetDecimal();
            var maxSlots = settings.GetProperty("promotionMaximumSlots").GetInt32();
            if (percentage is < 0 or > 100 || maxSlots < -1 || start.HasValue != end.HasValue ||
                (start.HasValue && end < start) || (percentage > 0 && start is null))
                throw new FormatException();
            return new(string.IsNullOrWhiteSpace(couponId) ? null : Guid.Parse(couponId), start, end, percentage, maxSlots);
        }
        catch (Exception ex) when (ex is JsonException or FormatException or KeyNotFoundException or InvalidOperationException)
        {
            throw new InvalidOperationException("Special Bookings discount settings in env.js are invalid.", ex);
        }
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
