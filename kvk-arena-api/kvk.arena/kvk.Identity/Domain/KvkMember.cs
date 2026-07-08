using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Enums;

namespace kvk.Identity.Domain;

public class KvkMember : User
{
    [MaxLength(20)]
    public required string MemberId { get; set; }

    public byte[]? ProfilePicture { get; set; } = Array.Empty<byte>();
    
    [Column(TypeName = "timestamp without time zone")]

    public DateTime? StartDate { get; set; }
    
    [Column(TypeName = "timestamp without time zone")]
    public DateTime? EndDate { get; set; }
    
    public bool IsPaid { get; set; }
    
    public MemberShipActiveStatus MembershipStatus {get; set; }

    public int? MembershipDurationDays { get; set; } = 0;
    
    //this is for eligible discounts for user at any time admin can enable or disable those and planned to create a hangfire job also for this
    public ICollection<MemberEligibleOffer> EligibleOffers { get; set; } = new List<MemberEligibleOffer>();

}

