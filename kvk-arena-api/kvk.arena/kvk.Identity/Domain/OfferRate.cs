using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Domain;

public class OfferRate : AuditableEntity
{
    [MaxLength(50)]
    public string? OfferName { get; set; } = string.Empty;

    [MaxLength(100)] public string? Description { get; set; }

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