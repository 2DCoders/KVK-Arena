using kvk.BuildingBlocks.Common;

namespace kvk.BuildingBlocks.Interfaces;

public interface ICouponValidationService
{
    Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(string memberId, string couponCode, decimal originalAmount, string moduleName,int slotCountForBadminton = 0,decimal pricePerSlot = 0);
    Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(string couponCode, decimal originalAmount, string moduleName,int slotCountForBadminton = 0);
    Task MarkCouponAsRedeemedAsync(string memberId, string couponCode);
    
    Task<Guid> GetMemberIdAsync(string memberId);
}
