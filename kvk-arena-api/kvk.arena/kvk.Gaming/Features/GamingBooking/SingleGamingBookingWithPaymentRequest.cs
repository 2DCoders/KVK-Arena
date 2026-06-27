using System.ComponentModel.DataAnnotations;
using kvk.Badminton.Features.Booking; // Reusing PaymentType enum

namespace kvk.Gaming.Features.GamingBooking;

public class SingleGamingBookingWithPaymentRequest
{
    [Required(ErrorMessage = "Gaming Category ID is required.")]
    public Guid GamingCategoryId { get; set; }

    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    [Required(ErrorMessage = "Gaming Slot ID is required.")]
    public Guid GamingSlotId { get; set; }
    
    public DateOnly BookingDate { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Customer Name is required.")]
    [StringLength(100, ErrorMessage = "Customer Name cannot exceed 100 characters.")]
    public string CustomerName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Customer Phone is required.")]
    [Phone(ErrorMessage = "Invalid phone number format.")]
    [StringLength(20, ErrorMessage = "Customer Phone cannot exceed 20 characters.")]
    public string PhoneNumber { get; set; } = string.Empty;
    
    public PaymentType PaymentType { get; set; }
}