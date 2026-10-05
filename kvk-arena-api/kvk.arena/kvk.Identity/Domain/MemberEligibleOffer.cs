using System.ComponentModel.DataAnnotations.Schema;
using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Domain;

public class MemberEligibleOffer : BaseEntity
{
    public Guid MemberId { get; set; }
    
    public KvkMember Member { get; set; }
    
    //this is only for the case when the offer is a coupon code, otherwise it will be null
    public string? CouponCode { get; set; }
    
    public OfferRate OfferRate { get; set; }

    public Guid OfferRateId { get; set; }
    public bool IsEligible { get; set; }
    
    [Column(TypeName = "timestamp without time zone")]
    public DateTime RedeemedDate { get; set; }
    
    public bool IsRedeemed { get; set; }
}