using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingBooking;

public class GetBookingsByCustomerRequest // Removed PagedRequest inheritance
{
    [Required(ErrorMessage = "Customer Phone is required.")]
    [Phone(ErrorMessage = "Invalid phone number format.")]
    public required string CustomerPhone { get; set; }
    public DateOnly? Date { get; set; }
    // Added properties for pagination since PagedRequest is removed
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}