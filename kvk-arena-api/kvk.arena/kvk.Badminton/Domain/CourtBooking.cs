using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Domain;

public class CourtBooking : AuditableEntity
{
    public Guid CourtId { get; set; }

    public Guid CourtSlotId { get; set; }

    public Court Court { get; set; }

    public CourtSlot CourtSlot { get; set; }

    public DateOnly BookingDate { get; set; }

    public Guid CustomerId { get; set; }

    public decimal BookingAmount { get; set; }

    public BookingStatus Status { get; set; }

    public string? Notes { get; set; }
    
}