namespace kvk.Identity.Domain;

public class MemberEligibleOffer
{
    public Guid Id { get; set; }

    public Guid MemberId { get; set; }
    public KvkMember Member { get; set; }

    public Guid OfferId { get; set; }
    public bool IsEligible { get; set; }
}