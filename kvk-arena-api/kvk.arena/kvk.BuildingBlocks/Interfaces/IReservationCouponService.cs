using System.Data.Common;
using kvk.BuildingBlocks.Common;

namespace kvk.BuildingBlocks.Interfaces;

public interface IReservationCouponService
{
    Task<CouponValidationResult> QuoteAsync(string couponCode, IReadOnlyList<decimal> slotPrices, CancellationToken ct);
    Task<CouponValidationResult> RedeemAsync(string couponCode, IReadOnlyList<decimal> slotPrices, DbTransaction transaction, CancellationToken ct);
}
