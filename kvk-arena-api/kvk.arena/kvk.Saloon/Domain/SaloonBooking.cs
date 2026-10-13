using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace kvk.Saloon.Domain;

public class SaloonBooking : AuditableEntity
{

    public Guid SaloonId { get; set; }

    public  string? CustomerName { get; set; }
    
    public  string? PhoneNumber { get; set; }
    
    public string? MemberId { get; set; }

    public DateOnly BookingDate { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public SaloonBookingStatus Status { get; set; }

    public decimal TotalAmount { get; set; }
    
    public decimal DiscountAmount { get; set; }
    
    public string? Notes { get; set; }

    public virtual Saloon Saloon { get; set; } = null!;
    
    public virtual ICollection<SaloonBookingService> Services { get; set; }
        = new List<SaloonBookingService>();
    
    public PaymentType? PaymentType { get; set; }
    public bool IsWalkIn { get; set; }
    public bool IsPaid { get; set; }
    [Column(TypeName = "timestamp without time zone")]
    public DateTime? PaidAt { get; set; }
}
