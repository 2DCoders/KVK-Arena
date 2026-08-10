using kvk.BuildingBlocks.Common;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Throw;

namespace kvk.Identity.Features.OfferRate;

public class OfferRateService : IOfferRateService
{
    private readonly IdentityApplicationDbContext _db;
    private readonly ILogger<OfferRateService> _logger;

    public OfferRateService(IdentityApplicationDbContext db, ILogger<OfferRateService> logger)
    {
        _db = db;
        _logger = logger;
    }


    public async Task<Result> CreateOfferRateAsync(OfferRateCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request is { IsPurchaseRequired: true, Price: <= 0 })
        {
            throw new ArgumentException("Price must be greater than zero when IsPurchaseRequired is true.");
        }


        var offerRate = new Domain.OfferRate
        {
            OfferName = request.OfferName,
            Description = request.Description,
            RateGym = request.RateGym,
            RateBadminton = request.RateBadminton,
            RateCarWash = request.RateCarWash,
            RateGaming = request.RateGaming,
            RateCafe = request.RateCafe,
            RateRetail = request.RateRetail,
            Price = request.Price,
            IsPurchaseRequired = request.IsPurchaseRequired,
            IsActive = request.IsActive,
            OfferType = request.OfferType
        };

        _db.OfferRates.Add(offerRate);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Offer Rate Created: {OfferRateId}", offerRate.Id);

        return Result.Success("Offer Rate Created");
    }

    public async Task<Result> UpdateOfferRateAsync(Guid id, OfferRateUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        var existRate = await _db.OfferRates.FindAsync(new object[] { id }, cancellationToken);

        existRate.ThrowIfNull("Offer Rate Not Found");

        if (request is { IsPurchaseRequired: true, Price: <= 0 })
        {
            throw new ArgumentException("Price must be greater than zero when IsPurchaseRequired is true.");
        }

        existRate.OfferName = request.OfferName;
        existRate.Description = request.Description;
        existRate.RateGym = request.RateGym;
        existRate.RateBadminton = request.RateBadminton;
        existRate.RateCarWash = request.RateCarWash;
        existRate.RateGaming = request.RateGaming;
        existRate.RateCafe = request.RateCafe;
        existRate.RateRetail = request.RateRetail;
        existRate.Price = request.Price;
        existRate.IsPurchaseRequired = request.IsPurchaseRequired;
        existRate.IsActive = request.IsActive;
        existRate.OfferType = request.OfferType;


        _db.OfferRates.Update(existRate);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Offer Rate Updated: {OfferRateId}", existRate.Id);

        return Result.Success("Offer Rate Updated");
    }

    public async Task<Result> DeleteOfferRateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existRate = await _db.OfferRates
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync(cancellationToken);

        existRate.ThrowIfNull("Offer Rate Not Found");

        _db.OfferRates.Remove(existRate);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Offer Rate Deleted: {OfferRateId}", existRate.Id);

        return Result.Success("Offer Rate Deleted");
    }

    public async Task<Result> ActivateOrDeactivateOfferRateAsync(Guid id, bool isActive,
        CancellationToken cancellationToken = default)
    {
        var existRate = await _db.OfferRates
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync(cancellationToken);

        existRate.ThrowIfNull("Offer Rate Not Found");

        existRate.IsActive = isActive;

        _db.OfferRates.Update(existRate);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Offer Rate {Status}: {OfferRateId}", isActive ? "Activated" : "Deactivated",
            existRate.Id);

        return Result.Success($"Offer Rate {(isActive ? "Activated" : "Deactivated")}");
    }

    public async Task<List<OfferRateResponse>> GetOfferRateListAsync(CancellationToken cancellationToken = default)
    {
        var existRates = await _db.OfferRates
            .Select(x => new OfferRateResponse
            {
                Id = x.Id,
                OfferName = x.OfferName,
                Description = x.Description,
                RateGym = x.RateGym,
                RateBadminton = x.RateBadminton,
                RateCarWash = x.RateCarWash,
                RateGaming = x.RateGaming,
                RateCafe = x.RateCafe,
                RateRetail = x.RateRetail,
                Price = x.Price,
                IsPurchaseRequired = x.IsPurchaseRequired,
                IsActive = x.IsActive,
                OfferType = x.OfferType
            })
            .ToListAsync(cancellationToken);

        return existRates;
    }

    public async Task<OfferRateResponse> GetOfferRateByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existRate = await _db.OfferRates
            .Select(x => new OfferRateResponse
            {
                Id = x.Id,
                OfferName = x.OfferName,
                Description = x.Description,
                RateGym = x.RateGym,
                RateBadminton = x.RateBadminton,
                RateCarWash = x.RateCarWash,
                RateGaming = x.RateGaming,
                RateCafe = x.RateCafe,
                RateRetail = x.RateRetail,
                Price = x.Price,
                IsPurchaseRequired = x.IsPurchaseRequired,
                IsActive = x.IsActive,
                OfferType = x.OfferType
            })
            .Where(x => x.Id == id)
            .FirstOrDefaultAsync(cancellationToken);

        existRate.ThrowIfNull("Offer Rate Not Found");

        return existRate;
    }

    public async Task<Result> AssignOfferRateToUserAsync(Guid offerRateId, List<Guid>? memberIdsList,
        CancellationToken cancellationToken = default)
    {
        var offerRate = await _db.OfferRates
            .Where(x => x.Id == offerRateId)
            .FirstOrDefaultAsync(cancellationToken);

        offerRate.ThrowIfNull("Offer Rate Not Found");

        if (memberIdsList == null || !memberIdsList.Any())
        {
            var allmembers = await _db.KvkMembers
                .Select(x => x.Id)
                .ToListAsync(cancellationToken);
            await GenerateEligibleOffersAndCoupons(offerRateId, allmembers, cancellationToken, offerRate);
            return Result.Success("Offer Rate Assigned to Members");
        }

        if (memberIdsList != null)
            await GenerateEligibleOffersAndCoupons(offerRateId, memberIdsList, cancellationToken, offerRate);

        return Result.Success("Offer Rate Assigned to Members");
    }

    public Task<List<MemberEligibleResponse>> GetEligibleMembersAsync(Guid? offerRateId, Guid? memberId,
        CancellationToken cancellationToken = default)
    {
        var query = _db.MemberEligibleOffers
            .AsNoTracking()
            .Include(x => x.OfferRate)
            .AsQueryable();

        if (offerRateId.HasValue)
        {
            query = query.Where(x => x.OfferRateId == offerRateId.Value);
        }

        if (memberId.HasValue)
        {
            query = query.Where(x => x.MemberId == memberId);
        }

        return query.Select(x => new MemberEligibleResponse
        {
            Id = x.Id,
            MemberId = x.MemberId,
            UserName = x.Member.FirstName + " " + x.Member.LastName,
            PhoneNumber = x.Member.Phone,
            OfferRateId = x.OfferRateId,
            CouponCode = x.CouponCode,
            IsEligible = x.IsEligible,
            IsRedeemed = x.IsRedeemed,
            RedeemedDate = x.RedeemedDate,
            OfferName = x.OfferRate.OfferName!,
        }).ToListAsync(cancellationToken);
    }

    protected virtual async Task GenerateEligibleOffersAndCoupons(Guid offerRateId, List<Guid> memberIdsList,
        CancellationToken cancellationToken, Domain.OfferRate offerRate)
    {
        //check whether for the given members has the existing offer it have do not update them keep them add only for the new members
        var existingMemberOffers = await _db.MemberEligibleOffers
            .Where(x => x.OfferRateId == offerRateId && memberIdsList.Contains(x.MemberId))
            .Select(x => x.MemberId)
            .ToListAsync(cancellationToken);

        var memberEligibleOffers = memberIdsList.Except(existingMemberOffers).ToList();


        if (offerRate.IsActive && offerRate.OfferType == OfferType.CouponCode)
        {
            //first create records and create random coupon code for each member and assign it to them
            foreach (var memberId in memberEligibleOffers)
            {
                var userOfferRate = new MemberEligibleOffer()
                {
                    MemberId = memberId,
                    OfferRateId = offerRate.Id,
                    CouponCode = CouponCodeGenerator.GenerateCouponCode(8),
                    IsEligible = true,
                    RedeemedDate = DateTime.Now,
                    IsRedeemed = false
                };

                _db.MemberEligibleOffers.Add(userOfferRate);
            }
        }
        else if (offerRate.IsActive && offerRate.OfferType != OfferType.CouponCode)
        {
            foreach (var memberId in memberEligibleOffers)
            {
                var userOfferRate = new MemberEligibleOffer()
                {
                    MemberId = memberId,
                    OfferRateId = offerRate.Id,
                    CouponCode = null,
                    IsEligible = true,
                    RedeemedDate = DateTime.Now,
                    IsRedeemed = false
                };

                _db.MemberEligibleOffers.Add(userOfferRate);
            }
        }

        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Offer Rate {OfferRateId} assigned to {MemberCount} members", offerRate.Id,
            memberEligibleOffers.Count);
    }
}