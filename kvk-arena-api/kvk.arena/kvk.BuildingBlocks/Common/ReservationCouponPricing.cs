namespace kvk.BuildingBlocks.Common;

public static class ReservationCouponPricing
{
    public static decimal Discount(IReadOnlyList<decimal> prices, decimal rate, int slotLimit) =>
        decimal.Round(prices.Take(Math.Max(0, slotLimit)).Sum() * Math.Clamp(rate, 0, 100) / 100m,
            2, MidpointRounding.AwayFromZero);
}
