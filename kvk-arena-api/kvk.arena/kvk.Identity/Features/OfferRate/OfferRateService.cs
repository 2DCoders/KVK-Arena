using kvk.BuildingBlocks.Common;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Throw;

namespace kvk.Identity.Features.OfferRate;

public class OfferRateService : IOfferRateService
{
    private readonly IdentityApplicationDbContext _db;
    private readonly ILogger<OfferRateService> _logger;

    public OfferRateService(IdentityApplicationDbContext db,ILogger<OfferRateService> logger)
    {
        _db = db;
        _logger = logger;
    }
    
    
    public async Task<Result> CreateOfferRateAsync(OfferRateCreateRequest request, CancellationToken cancellationToken = default)
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

    public async Task<Result> UpdateOfferRateAsync(Guid id,OfferRateUpdateRequest request, CancellationToken cancellationToken = default)
    {
        
        var existRate =  await _db.OfferRates.FindAsync(new object[] { id }, cancellationToken);
        
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
        
        var existRate =  await _db.OfferRates
            .Where(x=>x.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
        
        existRate.ThrowIfNull("Offer Rate Not Found");

        _db.OfferRates.Remove(existRate);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Offer Rate Deleted: {OfferRateId}", existRate.Id);
        
        return Result.Success("Offer Rate Deleted");
        
    }

    public async Task<Result> ActivateOrDeactivateOfferRateAsync(Guid id, bool isActive, CancellationToken cancellationToken = default)
    {
        var existRate =  await _db.OfferRates
            .Where(x=>x.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
        
        existRate.ThrowIfNull("Offer Rate Not Found");
        
        existRate.IsActive = isActive;
        
        _db.OfferRates.Update(existRate);
        await _db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Offer Rate {Status}: {OfferRateId}", isActive ? "Activated" : "Deactivated", existRate.Id);
        
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
            .Where(x=>x.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
        
        existRate.ThrowIfNull("Offer Rate Not Found");
        
        return existRate;
    }
}