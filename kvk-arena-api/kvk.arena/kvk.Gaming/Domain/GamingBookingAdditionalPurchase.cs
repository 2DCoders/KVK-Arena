using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingBookingAdditionalPurchase : AuditableEntity
{
    public Guid GamingBookingId { get; set; }
    public GamingBooking GamingBooking { get; set; } = null!;
    
    public Guid AdditionalPurchaseId { get; set; }
    public AdditionalPurchase AdditionalPurchase { get; set; } = null!;
    
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
