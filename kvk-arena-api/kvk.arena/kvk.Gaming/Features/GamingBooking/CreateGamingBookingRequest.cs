using System.ComponentModel.DataAnnotations;
using kvk.Badminton.Features.Booking;

namespace kvk.Gaming.Features.GamingBooking;

public class CreateGamingBookingRequest
{
    [Required(ErrorMessage = "Gaming Slot ID is required.")]
    public Guid GamingSlotId { get; set; }
    
    public DateOnly BookingDate { get; set; }
    
    public PaymentTypes PaymentType { get; set; }
    
    public decimal Amount { get; set; }


    [Required(ErrorMessage = "Customer Name is required.")]
    [StringLength(100, ErrorMessage = "Customer Name cannot exceed 100 characters.")]
    public required string CustomerName { get; set; }

    [Required(ErrorMessage = "Customer Phone is required.")]
    [Phone(ErrorMessage = "Invalid phone number format.")]
    [StringLength(20, ErrorMessage = "Customer Phone cannot exceed 20 characters.")]
    public required string CustomerPhone { get; set; }
}