using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingBookingHoldAdditionalPurchase : AuditableEntity
{
    public Guid GamingBookingHoldId { get; set; }
    public GamingBookingHold GamingBookingHold { get; set; } = null!;
    
    public Guid AdditionalPurchaseId { get; set; }
    public AdditionalPurchase AdditionalPurchase { get; set; } = null!;
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
