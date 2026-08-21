using kvk.Badminton;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace kvk.Identity.Services;

public class CouponValidationService : ICouponValidationService
{
    private readonly IdentityApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly BadmintonDbContext _badmintonDbContext;

    public CouponValidationService(IdentityApplicationDbContext context, IConfiguration configuration,
        BadmintonDbContext badmintonDbContext)
    {
        _context = context;
        _configuration = configuration;
        _badmintonDbContext = badmintonDbContext;
    }

    public async Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(
        string memberId,
        string couponCode,
        decimal originalAmount,
        string moduleName,
        int slotCountForBadminton = 0,
        decimal pricePerSlot = 0)
    {
        var memberIdGuid = await GetMemberIdAsync(memberId);
        if (memberIdGuid == Guid.Empty)
        {
            throw new Exception($"Member with MemberId '{memberId}' not found.");
        }

        var eligibleOffer = await _context.MemberEligibleOffers
            .Include(x => x.OfferRate)
            .FirstOrDefaultAsync(x =>
                x.CouponCode == couponCode &&
                x.MemberId == memberIdGuid);

        if (eligibleOffer == null)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "Invalid coupon code."
            };
        }

        if (!eligibleOffer.IsEligible)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "You are not eligible for this coupon."
            };
        }

        if (eligibleOffer.IsRedeemed)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "Coupon has already been redeemed."
            };
        }

        if (!eligibleOffer.OfferRate.IsActive)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "Coupon offer is no longer active."
            };
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
                return new CouponValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Invalid module for this coupon."
                };
        }

        if (discountRate <= 0)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = $"This coupon does not provide a discount for {moduleName}."
            };
        }

        decimal discountableAmount = originalAmount;

        // Badminton coupon discount is applicable to maximum 20 slots
        if (moduleName.Equals("badminton", StringComparison.OrdinalIgnoreCase))
        {
            if (slotCountForBadminton <= 0 || pricePerSlot <= 0)
            {
                return new CouponValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Invalid badminton slot information."
                };
            }

            var maxSlotCountForBadminton = _configuration.GetValue<int>("BadmintonMaxDiscountSlotLimit");

            int eligibleSlots = Math.Min(slotCountForBadminton, maxSlotCountForBadminton);

            discountableAmount = eligibleSlots * pricePerSlot;

            // Don't allow discountable amount to exceed original amount
            discountableAmount = Math.Min(discountableAmount, originalAmount);
        }

        var discountAmount = (discountRate / 100) * discountableAmount;

        return new CouponValidationResult
        {
            IsValid = true,
            DiscountAmount = discountAmount
        };
    }

    public async Task<CouponValidationResult> ValidateAndCalculateDiscountAsync(string couponCode,
        decimal originalAmount, string moduleName, int slotCountForBadminton = 0)
    {
        var pricePerSlot = await _badmintonDbContext.Courts
            .Select(x => x.PricePerSlot)
            .FirstOrDefaultAsync(CancellationToken.None);

        var eligibleOffer = await _context.MemberEligibleOffers
            .Include(x => x.OfferRate)
            .FirstOrDefaultAsync(x =>
                x.CouponCode == couponCode);

        if (eligibleOffer == null)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "Invalid coupon code."
            };
        }

        if (!eligibleOffer.IsEligible)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "You are not eligible for this coupon."
            };
        }

        if (eligibleOffer.IsRedeemed)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "Coupon has already been redeemed."
            };
        }

        if (!eligibleOffer.OfferRate.IsActive)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = "Coupon offer is no longer active."
            };
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
                return new CouponValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Invalid module for this coupon."
                };
        }

        if (discountRate <= 0)
        {
            return new CouponValidationResult
            {
                IsValid = false,
                ErrorMessage = $"This coupon does not provide a discount for {moduleName}."
            };
        }

        decimal discountableAmount = originalAmount;

        // Badminton coupon discount is applicable to maximum 20 slots
        if (moduleName.Equals("badminton", StringComparison.OrdinalIgnoreCase))
        {
            if (slotCountForBadminton <= 0 || pricePerSlot <= 0)
            {
                return new CouponValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Invalid badminton slot information."
                };
            }

            var maxSlotCountForBadminton = _configuration.GetValue<int>("BadmintonMaxDiscountSlotLimit");

            int eligibleSlots = Math.Min(slotCountForBadminton, maxSlotCountForBadminton);

            discountableAmount = eligibleSlots * pricePerSlot;

            // Don't allow discountable amount to exceed original amount
            discountableAmount = Math.Min(discountableAmount, originalAmount);
        }

        var discountAmount = (discountRate / 100) * discountableAmount;

        return new CouponValidationResult
        {
            IsValid = true,
            DiscountAmount = discountAmount
        };
    }

    public async Task MarkCouponAsRedeemedAsync(string memberId, string couponCode)
    {
        var memberIdGuid = await GetMemberIdAsync(memberId);

        var eligibleOffer = await _context.MemberEligibleOffers
            .FirstOrDefaultAsync(x => x.MemberId == memberIdGuid && x.CouponCode == couponCode);

        if (eligibleOffer != null)
        {
            eligibleOffer.IsRedeemed = true;
            eligibleOffer.RedeemedDate = DateTime.SpecifyKind(
                DateTime.UtcNow,
                DateTimeKind.Unspecified
            );
            await _context.SaveChangesAsync();
        }
    }

    public Task<Guid> GetMemberIdAsync(string memberId)
    {
        var memberIdGuid = _context.KvkMembers
            .Where(m => m.MemberId == memberId)
            .Select(m => m.Id)
            .FirstOrDefaultAsync();

        memberIdGuid.ContinueWith(task =>
        {
            if (task.Result == Guid.Empty)
            {
                throw new Exception($"Member with MemberId '{memberId}' not found.");
            }
        });


        return memberIdGuid;
    }
}