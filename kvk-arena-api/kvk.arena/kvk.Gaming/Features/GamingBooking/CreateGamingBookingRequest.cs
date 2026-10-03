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
    
    public string? CustomerName { get; set; }
    
    public  string? CustomerPhone { get; set; }
    
    public List<BookingAdditionalPurchaseRequest>? AdditionalPurchases { get; set; }
}