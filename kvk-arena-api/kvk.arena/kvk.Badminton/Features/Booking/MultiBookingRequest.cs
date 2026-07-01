using kvk.Badminton.Features.Booking;

namespace kvk.Badminton.Features.Booking;

public class MultiBookingRequest
{
    public List<BookingDetailRequest> Bookings { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public string? CustomerName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; } = string.Empty;
    public PaymentTypes PaymentTypes { get; set; }
}

public enum PaymentTypes
{
    Cash = 1,
    Card = 2
}