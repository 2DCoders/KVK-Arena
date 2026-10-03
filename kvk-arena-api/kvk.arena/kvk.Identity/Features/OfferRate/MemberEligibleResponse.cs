namespace kvk.Identity.Features.OfferRate;

public class MemberEligibleResponse
{
    public Guid Id { get; set; }

    public Guid MemberId { get; set; }
    
    public required string UserName { get; set; }
    public string PhoneNumber { get; set; }
    
    //this is only for the case when the offer is a coupon code, otherwise it will be null
    public string? CouponCode { get; set; }

    public Guid OfferRateId { get; set; }
    
    public string OfferName { get; set; }
    
    public bool IsEligible { get; set; }
    
    public DateTime RedeemedDate { get; set; }
    
    public bool IsRedeemed { get; set; }
}