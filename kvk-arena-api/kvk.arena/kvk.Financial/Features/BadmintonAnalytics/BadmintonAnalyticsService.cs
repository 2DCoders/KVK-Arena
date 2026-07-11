using kvk.Badminton;
using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Features.Booking;
using Microsoft.EntityFrameworkCore;

namespace kvk.Financial.Features.BadmintonAnalytics;

public class BadmintonAnalyticsService
{
    private readonly BadmintonDbContext _context;

    public BadmintonAnalyticsService(BadmintonDbContext context)
    {
        _context = context;
    }

    public async Task<BadmintonAnalyticsResponse> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var bookings = await _context.CourtBookings.ToListAsync(cancellationToken);

        var filteredBookings = bookings.Where(b => b.BookingDate.ToDateTime(TimeOnly.MinValue) >= startDate && b.BookingDate.ToDateTime(TimeOnly.MinValue) <= endDate).ToList();

        var response = new BadmintonAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalTransactions = filteredBookings.Count,
            SuccessfulTransactions = filteredBookings.Count(b => b.Status == BookingStatus.Confirmed),
            PendingTransactions = filteredBookings.Count(b => b.Status == BookingStatus.Pending),
            CancelledTransactions = filteredBookings.Count(b => b.Status == BookingStatus.Cancelled),

            TotalRevenue = filteredBookings.Where(b => b.Status == BookingStatus.Confirmed).Sum(b => b.BookingAmount),
            PendingRevenue = filteredBookings.Where(b => b.Status == BookingStatus.Pending).Sum(b => b.BookingAmount),
            CancelledRevenue = filteredBookings.Where(b => b.Status == BookingStatus.Cancelled).Sum(b => b.BookingAmount),

            CashRevenue = filteredBookings.Where(b => b.PaymentType == PaymentTypes.Cash && b.Status == BookingStatus.Confirmed).Sum(b => b.BookingAmount),
            CreditCardRevenue = filteredBookings.Where(b => b.PaymentType == PaymentTypes.Card && b.Status == BookingStatus.Confirmed).Sum(b => b.BookingAmount),
            PayPalRevenue = 0,
        };

        return response;
    }
}