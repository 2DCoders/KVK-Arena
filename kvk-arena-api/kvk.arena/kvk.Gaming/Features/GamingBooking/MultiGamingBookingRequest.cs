using System.ComponentModel.DataAnnotations;
using kvk.Badminton.Features.Booking; // Reusing PaymentType enum

namespace kvk.Gaming.Features.GamingBooking;

public class MultiGamingBookingRequest
{
    [Required(ErrorMessage = "At least one booking detail is required.")]
    public List<GamingBookingDetailRequest> Bookings { get; set; } = new();

    [Range(0.01, double.MaxValue, ErrorMessage = "Total amount must be greater than 0.")]
    public decimal TotalAmount { get; set; }

    [Required(ErrorMessage = "Customer Name is required.")]
    [StringLength(100, ErrorMessage = "Customer Name cannot exceed 100 characters.")]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Customer Phone is required.")]
    [Phone(ErrorMessage = "Invalid phone number format.")]
    [StringLength(20, ErrorMessage = "Customer Phone cannot exceed 20 characters.")]
    public string CustomerPhone { get; set; } = string.Empty;
    
    public PaymentType PaymentType { get; set; }
}