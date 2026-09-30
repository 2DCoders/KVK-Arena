using kvk.Saloon.Domain;

namespace kvk.Saloon.Features.Booking;

public class GetSaloonBookingsListRequest
{
    public DateOnly? FromDate { get; set; }
    public DateOnly? ToDate { get; set; }
    public SaloonBookingStatus? Status { get; set; }
    public string? SearchTerm { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 500;
}
