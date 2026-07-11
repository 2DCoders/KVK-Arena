using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Enums;

namespace kvk.Identity.Features.KvkMember;

public class KvkMemberResponse
{
    public Guid Id { get; set; }
    
    public string MemberId { get; set; } = string.Empty;
    
    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public required string UserName { get; set; }

    public required string Email { get; set; }

    public string? Phone { get; set; }
    
    public required string Status { get; set; }
    
    public Gender Gender { get; set; }
    
    public byte[]? ProfilePicture { get; set; } = Array.Empty<byte>();
    
    public DateTime? StartDate { get; set; }
    
    public DateTime? EndDate { get; set; }
    
    public bool IsPaid { get; set; }
    
    public MemberShipActiveStatus MembershipStatus {get; set; }
    
    public string? NicNumber { get; set; }
    
    
}