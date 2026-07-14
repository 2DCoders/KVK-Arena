using kvk.Identity.Domain;

namespace kvk.Identity.Features.OfferRate;

public class OfferRateResponse
{
    public required Guid Id {get; set;} 
    
    public string? OfferName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal? RateGym { get; set; } = int.MinValue;

    public decimal? RateBadminton { get; set; } = int.MinValue;

    public decimal? RateCarWash { get; set; } = int.MinValue;

    public decimal? RateGaming { get; set; } = int.MinValue;

    public decimal? RateCafe { get; set; } = int.MinValue;

    public decimal? RateRetail { get; set; } = int.MinValue;

    public decimal? Price { get; set; } = int.MinValue;

    public bool IsPurchaseRequired { get; set; } = false;
    
    public bool IsActive { get; set; } = true;
    
    public OfferType OfferType { get; set; } = OfferType.GeneralOffer;
}