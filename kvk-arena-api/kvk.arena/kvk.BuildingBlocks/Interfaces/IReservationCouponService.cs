using System.Data.Common;
using kvk.BuildingBlocks.Common;

namespace kvk.BuildingBlocks.Interfaces;

public interface IReservationCouponService
{
    Task RestoreAsync(string couponCode, DbTransaction transaction, CancellationToken ct);
    Task<CouponValidationResult> QuoteAsync(string couponCode, IReadOnlyList<decimal> slotPrices, CancellationToken ct, CashierCouponLimit? cashierLimit = null);
    Task<CouponValidationResult> RedeemAsync(string couponCode, IReadOnlyList<decimal> slotPrices, DbTransaction transaction, CancellationToken ct, CashierCouponLimit? cashierLimit = null);
}

public record CashierCouponLimit(Guid? CouponCodeId)
{
    public int MaximumSlots(Guid couponId, Guid offerRateId, int slotCount) =>
        CouponCodeId == couponId || CouponCodeId == offerRateId ? Math.Min(10, slotCount) : slotCount;
}
