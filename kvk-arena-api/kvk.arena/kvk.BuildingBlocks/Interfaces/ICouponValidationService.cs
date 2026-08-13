using kvk.BuildingBlocks.Common;

namespace kvk.BuildingBlocks.Interfaces;

public interface ICouponValidationService
{
    Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(Guid memberId, string couponCode, decimal originalAmount, string moduleName);
    Task MarkCouponAsRedeemedAsync(Guid memberId, string couponCode);
}
