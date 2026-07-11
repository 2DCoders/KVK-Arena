using kvk.Badminton.Features.Booking;
using kvk.Financial.Features.BadmintonAnalytics;
using kvk.Gaming;
using kvk.Gaming.Enums;
using Microsoft.EntityFrameworkCore;

namespace kvk.Financial.Features.GamingAnalytics;

public class GamingAnalyticsService
{
    private readonly GamingDbContext _context;

    public GamingAnalyticsService(GamingDbContext context)
    {
        _context = context;
    }

    public async Task<GamingAnalyticsResponse> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var bookings = await _context.GamingBookings.ToListAsync(cancellationToken);

        var filteredBookings = bookings.Where(b => b.BookingDate.ToDateTime(TimeOnly.MinValue) >= startDate && b.BookingDate.ToDateTime(TimeOnly.MinValue) <= endDate).ToList();

        var response = new GamingAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalTransactions = filteredBookings.Count,
            SuccessfulTransactions = filteredBookings.Count(b => b.Status == GamingBookingStatus.Confirmed),
            PendingTransactions = filteredBookings.Count(b => b.Status == GamingBookingStatus.Pending),
            CancelledTransactions = filteredBookings.Count(b => b.Status == GamingBookingStatus.Cancelled),

            TotalRevenue = filteredBookings.Where(b => b.Status == GamingBookingStatus.Confirmed).Sum(b => b.Amount),
            PendingRevenue = filteredBookings.Where(b => b.Status == GamingBookingStatus.Pending).Sum(b => b.Amount),
            CancelledRevenue = filteredBookings.Where(b => b.Status == GamingBookingStatus.Cancelled).Sum(b => b.Amount),

            CashRevenue = filteredBookings.Where(b => b.PaymentType == PaymentTypes.Cash && b.Status == GamingBookingStatus.Confirmed).Sum(b => b.Amount),
            CreditCardRevenue = filteredBookings.Where(b => b.PaymentType == PaymentTypes.Card && b.Status == GamingBookingStatus.Confirmed).Sum(b => b.Amount),
            PayPalRevenue = 0,
        };

        return response;
    }
}