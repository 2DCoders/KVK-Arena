using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;
using System.ComponentModel.DataAnnotations.Schema; // Added for [Column] attribute

namespace kvk.Badminton.Domain;

public class BookingHold : AuditableEntity
{
    public Guid CourtId { get; set; }
    public Guid CourtSlotId { get; set; }
    public DateOnly BookingDate { get; set; }
    
    [Column(TypeName = "timestamp with time zone")] // Configured for timestamp with time zone
    public DateTime ExpiresAt { get; set; }
    public BookingHoldStatus Status { get; set; }
    
    public decimal Amount { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    // Metadata for payment tracking
    public string? PaymentIntentId { get; set; }
    public string? PaymentId { get; set; }
}