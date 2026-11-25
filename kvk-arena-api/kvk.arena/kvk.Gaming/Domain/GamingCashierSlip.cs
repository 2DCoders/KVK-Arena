using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingCashierSlip : AuditableEntity
{
    public required string CustomerName { get; set; }
    public required string PhoneNumber { get; set; }
    public required Guid[] HoldIds { get; set; }
    public required decimal[] Amounts { get; set; }
    public DateTime PaymentDueUtc { get; set; }
    public Guid? Revision { get; set; }
    public byte[]? Document { get; set; }
    public string? ContentType { get; set; }
    public bool Approved { get; set; }
    public bool SmsSent { get; set; }
}
