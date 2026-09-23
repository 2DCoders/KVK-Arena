using kvk.Badminton.Features.Booking;

namespace kvk.Gaming.Features.GamingBooking;

public class MultiGamingPaymentRequest
{
    public List<Guid> HoldIds { get; set; } = new List<Guid>();
    public string PaymentIntentId { get; set; } = string.Empty;
    
    public CustomerDetailsDto CustomerDetails { get; set; } = new CustomerDetailsDto();

}

public class CustomerDetailsDto
{
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    
    public PaymentTypes  PaymentType { get; set; }
}
