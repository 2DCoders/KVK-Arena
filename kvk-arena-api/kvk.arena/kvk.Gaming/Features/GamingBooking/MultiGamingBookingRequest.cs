using System.ComponentModel.DataAnnotations;
using kvk.Badminton.Features.Booking; // Reusing PaymentType enum

namespace kvk.Gaming.Features.GamingBooking;

public class MultiGamingBookingRequest
{
    [Required(ErrorMessage = "At least one booking detail is required.")]
    public List<GamingBookingDetailRequest> Bookings { get; set; } = new();

    [Range(0.01, double.MaxValue, ErrorMessage = "Total amount must be greater than 0.")]
    public decimal TotalAmount { get; set; }
    
    public string? CustomerName { get; set; } = string.Empty;
    
    public string? CustomerPhone { get; set; } = string.Empty;
    
    public PaymentTypes PaymentTypes { get; set; }
}