using System.ComponentModel.DataAnnotations.Schema;
using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using kvk.Badminton.Features.CourtBookingTemporary;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Enums;

namespace kvk.Badminton.Domain;

public class CourtBookingTemporary : AuditableEntity
{
    public Guid CourtId { get; set; }

    public Guid MemberId { get; set; }

    // The date from which the reservation starts.
    [Column(TypeName = "timestamp without time zone")]

    public DateTime StartDate { get; set; }

    // Example: 8 = 1 month when 2 weekly slots are selected.
    public int NumberOfSlots { get; set; }

    public decimal Amount { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal FinalAmount { get; set; }

    public string? CouponCode { get; set; }

    public PaymentType PaymentType { get; set; }

    public byte[]? PaymentProof { get; set; }

    public bool IsHalfPayment { get; set; }

    public bool IsMigrated { get; set; }
    
    public DateTime? MigratedAt { get; set; }

    public ICollection<CourtBookingTemporarySchedule> Schedules { get; set; }
        = new List<CourtBookingTemporarySchedule>();
}


public class CourtBookingTemporarySchedule : AuditableEntity
{
    public Guid CourtBookingTemporaryId { get; set; }

    public CourtBookingTemporary CourtBookingTemporary { get; set; }

    public DaysOfWeek DayOfWeek { get; set; }

    public Guid SlotId { get; set; }
}