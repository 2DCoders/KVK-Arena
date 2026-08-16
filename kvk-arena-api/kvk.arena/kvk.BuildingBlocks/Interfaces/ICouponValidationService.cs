using kvk.BuildingBlocks.Common;

namespace kvk.BuildingBlocks.Interfaces;

public interface ICouponValidationService
{
    Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(string memberId, string couponCode, decimal originalAmount, string moduleName);
    Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(string couponCode, decimal originalAmount, string moduleName);
    Task MarkCouponAsRedeemedAsync(string memberId, string couponCode);
    
    Task<Guid> GetMemberIdAsync(string memberId);
}
