using System.ComponentModel.DataAnnotations.Schema;

namespace kvk.Identity.Features.KvkMember;

public class MemberPayRequest
{
    public Guid MemberId { get; set; }

    public bool IsPaid { get; set; }

    [Column(TypeName = "timestamp without time zone")]

    public DateTime? StartDate { get; set; }
    [Column(TypeName = "timestamp without time zone")]

    public DateTime? EndDate { get; set; }
    
}