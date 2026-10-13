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
        var paidBookings = await _context.SaloonBookings.AsNoTracking()
            .Where(b => b.IsPaid && b.PaidAt >= startDate && b.PaidAt < endDate)
            .ToListAsync(cancellationToken);
        var bookings = await _context.SaloonBookings.AsNoTracking()
            .Where(b => b.CreatedAt >= startDate && b.CreatedAt < endDate)
            .ToListAsync(cancellationToken);

        var filteredBookings = bookings;


        var response = new SaloonAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalTransactions = paidBookings.Count,
            SuccessfulTransactions = paidBookings.Count,
            PendingTransactions = filteredBookings.Count(b => !b.IsPaid && b.Status != SaloonBookingStatus.Cancelled && b.Status != SaloonBookingStatus.NoShow),
            CancelledTransactions = filteredBookings.Count(b => b.Status == SaloonBookingStatus.Cancelled || b.Status == SaloonBookingStatus.NoShow),

            TotalRevenue = paidBookings.Sum(b => b.TotalAmount),
            PendingRevenue = filteredBookings.Where(b => !b.IsPaid && b.Status != SaloonBookingStatus.Cancelled && b.Status != SaloonBookingStatus.NoShow).Sum(b => b.TotalAmount),
            CancelledRevenue = filteredBookings.Where(b => b.Status == SaloonBookingStatus.Cancelled || b.Status == SaloonBookingStatus.NoShow).Sum(b => b.TotalAmount),

            CashRevenue = paidBookings.Where(b => b.PaymentType == PaymentType.Cash).Sum(b => b.TotalAmount),
            CreditCardRevenue = paidBookings.Where(b => b.PaymentType == PaymentType.CreditCard).Sum(b => b.TotalAmount),
            DebitCardRevenue = paidBookings.Where(b => b.PaymentType == PaymentType.DebitCard).Sum(b => b.TotalAmount),
            PayPalRevenue = paidBookings.Where(b => b.PaymentType == PaymentType.PayPal).Sum(b => b.TotalAmount),
            OnlinePaymentRevenue = paidBookings.Where(b => b.PaymentType == PaymentType.OnlinePayment).Sum(b => b.TotalAmount),
        };

        return response;
    }
}
