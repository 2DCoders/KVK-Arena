namespace kvk.Badminton.Features.Booking;

public class BookingResponse
{
    public Guid HoldId { get; set; }
    public Guid? BookingId { get; set; }
    public Guid CourtId { get; set; }
    public Guid CourtSlotId { get; set; }
    public DateOnly BookingDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
    public string Message { get; set; } = string.Empty;

    // PayHere checkout fields, populated by CreateSingleBookingWithPaymentAsync
    public string? MerchantId { get; set; }
    public string? OrderId { get; set; }
    public string? Currency { get; set; }
    public string? Amount { get; set; }
    public string? Hash { get; set; }
}