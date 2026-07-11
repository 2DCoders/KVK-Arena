using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingBooking;

public class GamingBookingDetailRequest
{
    [Required(ErrorMessage = "Gaming Category ID is required.")]
    public Guid GamingCategoryId { get; set; }

    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    [Required(ErrorMessage = "Gaming Slot ID is required.")]
    public Guid GamingSlotId { get; set; }
    
    public DateOnly BookingDate { get; set; }
}