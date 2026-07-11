using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingBooking;

public class GetBookingsByGamingStationRequest // Removed PagedRequest inheritance
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }
    public DateOnly? Date { get; set; }
    // Added properties for pagination since PagedRequest is removed
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}