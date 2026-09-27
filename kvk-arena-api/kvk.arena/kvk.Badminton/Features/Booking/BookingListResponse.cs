using kvk.Badminton.Enums;

namespace kvk.Badminton.Features.Booking;

public class BookingListResponse
{
    public Guid Id { get; set; }
    public required string BookingNumber { get; set; }
    public Guid CourtId { get; set; }
    public string CourtName { get; set; } = string.Empty;
    public Guid CourtSlotId { get; set; }
    public DateOnly SlotDate { get; set; }
    public TimeOnly SlotStartTime { get; set; }
    public TimeOnly SlotEndTime { get; set; }
    public required string CustomerName { get; set; }
    public required string PhoneNumber { get; set; }
    public decimal BookingAmount { get; set; }
    public BookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public PaymentTypes PaymentType { get; set; }
    public string? Notes { get; set; }
}
