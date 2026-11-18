using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Domain;

public class MemberSlipReservation : AuditableEntity
{
    public Guid HoldToken { get; set; }
    public string CustomerName { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string Email { get; set; } = "";
    public decimal FinalAmount { get; set; }
    public DateTime PaymentDueUtc { get; set; }
    public int? MaximumDiscountableSlots { get; set; }
    public string? CouponCode { get; set; }
    public bool Cancelled { get; set; }
    public bool Approved { get; set; }
    public string? RejectionReason { get; set; }
    public bool Rejected { get; set; }
    public bool SmsSent { get; set; }
    public byte[]? Slip { get; set; }
    public string? SlipContentType { get; set; }
}
