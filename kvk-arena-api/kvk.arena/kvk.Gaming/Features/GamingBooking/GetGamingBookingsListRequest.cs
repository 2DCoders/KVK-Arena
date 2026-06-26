using kvk.Gaming.Enums;

namespace kvk.Gaming.Features.GamingBooking;

public class GetGamingBookingsListRequest // Removed PagedRequest inheritance
{
    public string? SearchTerm { get; set; }
    public Guid? GamingStationId { get; set; }
    public Guid? GamingCategoryId { get; set; }
    public GamingBookingStatus? Status { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    // Added properties for pagination since PagedRequest is removed
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}