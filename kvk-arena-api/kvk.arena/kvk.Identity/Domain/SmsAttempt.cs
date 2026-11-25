using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.Identity.Domain;

public class SmsAttempt : BaseEntity
{
    public DateTime SubmittedUtc { get; set; }
    public required string PhoneNumber { get; set; }
    public bool AdminBatch { get; set; }
    public SmsAttemptStatus Status { get; set; }
    public int? Segments { get; set; }
    public decimal MaintenanceCharge { get; set; }
}
