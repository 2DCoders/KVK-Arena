using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Domain;

public class CourtBooking : AuditableEntity, ICustomerDetails
{
    public Guid CourtId { get; set; }

    public Guid CourtSlotId { get; set; }
    
    public string BookingNumber { get; set; } = string.Empty;
    public PaymentTypes  PaymentType { get; set; }

    public Court Court { get; set; }

    public CourtSlot CourtSlot { get; set; }

    public DateOnly BookingDate { get; set; }

    public decimal BookingAmount { get; set; }

    public BookingStatus Status { get; set; }

    public string? Notes { get; set; }

    public required string CustomerName { get; set; }
    public required string PhoneNumber { get; set; }
    
    public string? PaymentId { get; set; }

}