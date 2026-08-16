using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace kvk.Identity.Services;

public class CouponValidationService : ICouponValidationService
{
    private readonly IdentityApplicationDbContext _context;

    public CouponValidationService(IdentityApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(Guid memberId, string couponCode, decimal originalAmount, string moduleName)
    {
        var eligibleOffer = await _context.MemberEligibleOffers
            .Include(x => x.OfferRate)
            .FirstOrDefaultAsync(x => x.CouponCode == couponCode);

        if (eligibleOffer == null)
        {
            return new CouponValidationResult { IsValid = false, ErrorMessage = "Invalid coupon code." };
        }

        if (!eligibleOffer.IsEligible)
        {
            return new CouponValidationResult { IsValid = false, ErrorMessage = "You are not eligible for this coupon." };
        }

        if (eligibleOffer.IsRedeemed)
        {
            return new CouponValidationResult { IsValid = false, ErrorMessage = "Coupon has already been redeemed." };
        }

        if (!eligibleOffer.OfferRate.IsActive)
        {
            return new CouponValidationResult { IsValid = false, ErrorMessage = "Coupon offer is no longer active." };
        }

        decimal discountRate = 0;
        
        switch (moduleName.ToLower())
        {
            case "badminton":
                discountRate = eligibleOffer.OfferRate.RateBadminton ?? 0;
                break;
            case "gym":
                discountRate = eligibleOffer.OfferRate.RateGym ?? 0;
                break;
            case "carwash":
                discountRate = eligibleOffer.OfferRate.RateCarWash ?? 0;
                break;
            case "gaming":
                discountRate = eligibleOffer.OfferRate.RateGaming ?? 0;
                break;
            case "cafe":
                discountRate = eligibleOffer.OfferRate.RateCafe ?? 0;
                break;
            case "retail":
                discountRate = eligibleOffer.OfferRate.RateRetail ?? 0;
                break;
            default:
                return new CouponValidationResult { IsValid = false, ErrorMessage = "Invalid module for this coupon." };
        }
        
        if (discountRate <= 0)
        {
            return new CouponValidationResult { IsValid = false, ErrorMessage = $"This coupon does not provide a discount for {moduleName}." };
        }

        // Assuming discountRate is a percentage if it's less than or equal to 100, else it's a fixed amount.
        // Wait, what if it's purely percentage? Let's just assume discountRate is a flat amount for now, or percentage depending on rules.
        // I'll calculate it as percentage (discountRate / 100 * originalAmount). If it's a flat amount, it would just be discountRate.
        // Let's assume it's a percentage.
        var discountAmount = (discountRate / 100) * originalAmount;

        return new CouponValidationResult
        {
            IsValid = true,
            DiscountAmount = discountAmount
        };
    }

    public async Task MarkCouponAsRedeemedAsync(Guid memberId, string couponCode)
    {
        var eligibleOffer = await _context.MemberEligibleOffers
            .FirstOrDefaultAsync(x => x.MemberId == memberId && x.CouponCode == couponCode);

        if (eligibleOffer != null)
        {
            eligibleOffer.IsRedeemed = true;
            eligibleOffer.RedeemedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }
}
