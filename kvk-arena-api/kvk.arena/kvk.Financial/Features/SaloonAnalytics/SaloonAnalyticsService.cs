using kvk.BuildingBlocks.Enums;
using Kvk.Cafe;
using kvk.Saloon.Domain;
using Microsoft.EntityFrameworkCore;

namespace kvk.Financial.Features.SaloonAnalytics;

public class SaloonAnalyticsService
{
    private readonly SaloonDbContext _context;

    public SaloonAnalyticsService(SaloonDbContext context)
    {
        _context = context;
    }

    public async Task<SaloonAnalyticsResponse> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var bookings = await _context.SaloonBookings.ToListAsync(cancellationToken);

        var filteredBookings = bookings.Where(b => b.CreatedAt >= startDate && b.CreatedAt <= endDate).ToList();

        var successfulStatuses = new[] { SaloonBookingStatus.Confirmed, SaloonBookingStatus.InProgress, SaloonBookingStatus.Completed };

        var response = new SaloonAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalTransactions = filteredBookings.Count,
            SuccessfulTransactions = filteredBookings.Count(b => successfulStatuses.Contains(b.Status)),
            PendingTransactions = filteredBookings.Count(b => b.Status == SaloonBookingStatus.Pending),
            CancelledTransactions = filteredBookings.Count(b => b.Status == SaloonBookingStatus.Cancelled || b.Status == SaloonBookingStatus.NoShow),

            TotalRevenue = filteredBookings.Where(b => successfulStatuses.Contains(b.Status)).Sum(b => b.TotalAmount),
            PendingRevenue = filteredBookings.Where(b => b.Status == SaloonBookingStatus.Pending).Sum(b => b.TotalAmount),
            CancelledRevenue = filteredBookings.Where(b => b.Status == SaloonBookingStatus.Cancelled || b.Status == SaloonBookingStatus.NoShow).Sum(b => b.TotalAmount),

            CashRevenue = filteredBookings.Where(b => b.PaymentType == PaymentType.Cash && successfulStatuses.Contains(b.Status)).Sum(b => b.TotalAmount),
            CreditCardRevenue = filteredBookings.Where(b => b.PaymentType == PaymentType.CreditCard && successfulStatuses.Contains(b.Status)).Sum(b => b.TotalAmount),
            DebitCardRevenue = filteredBookings.Where(b => b.PaymentType == PaymentType.DebitCard && successfulStatuses.Contains(b.Status)).Sum(b => b.TotalAmount),
            PayPalRevenue = filteredBookings.Where(b => b.PaymentType == PaymentType.PayPal && successfulStatuses.Contains(b.Status)).Sum(b => b.TotalAmount),
            OnlinePaymentRevenue = filteredBookings.Where(b => b.PaymentType == PaymentType.OnlinePayment && successfulStatuses.Contains(b.Status)).Sum(b => b.TotalAmount),
        };

        return response;
    }
}
