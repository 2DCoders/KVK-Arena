using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Domain;

public class AdminSmsBatch : BaseEntity
{
    public Guid StaffId { get; set; }
    public DateTime SubmittedUtc { get; set; }
    public required string Message { get; set; }
    public string? GroupName { get; set; }
    public required string RecipientsJson { get; set; }
    public int SegmentsPerRecipient { get; set; }
    public int ReservedSegments { get; set; }
    public int AcceptedSegments { get; set; }
    public int MonthlyLimit { get; set; }
    public decimal SegmentPrice { get; set; }
    public decimal MaintenanceCharge { get; set; }
    public bool Completed { get; set; }
}

public class AdminSmsGroup : BaseEntity
{
    public required string Name { get; set; }
    public Guid[] MemberIds { get; set; } = [];
}
