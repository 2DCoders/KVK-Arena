using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingBooking;

public class CancelGamingBookingRequest
{
    [Required(ErrorMessage = "Booking ID is required.")]
    public Guid BookingId { get; set; }
}