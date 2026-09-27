using kvk.Badminton.Enums;

namespace kvk.Badminton.Features.Booking;

public class GetBookingsListRequest
{
    public string? SearchTerm { get; set; }
    public Guid? CourtId { get; set; }
    public BookingStatus? Status { get; set; }
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
