using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Domain;

public class CashierSlipReservation : AuditableEntity
{
    public Guid HoldToken { get; set; }
    public string CustomerName { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public DateTime PaymentDueUtc { get; set; }
    public decimal FinalAmount { get; set; }
    public Guid[] SlotHoldIds { get; set; } = [];
    public decimal[] FinalSlotAmounts { get; set; } = [];
    public decimal[]? CouponBasePrices { get; set; }
    public string? CouponCode { get; set; }
    public Guid? LimitedCouponId { get; set; }
    public decimal CouponDiscount { get; set; }
    public bool IsPromotion { get; set; }
    public bool Approved { get; set; }
    public bool SmsSent { get; set; }
    public Guid? SlipRevision { get; set; }
    public byte[]? Slip { get; set; }
    public string? SlipContentType { get; set; }
}
