using kvk.BuildingBlocks.Enums;
using Kvk.Cafe;
using kvk.CarService;
using kvk.CarService.Domain;
using kvk.Financial.Features.CarserviceAnalytics;
using Microsoft.EntityFrameworkCore;

namespace kvk.Financial.Features.CafeAnalytics;

public class CafeAnalyticsService
{
    private readonly CafeDbContext _context;

    public CafeAnalyticsService(CafeDbContext context)
    {
        _context = context;
    }

    public async Task<CafeAnalyticsResponse> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var bookings = await _context.Orders.ToListAsync(cancellationToken);

        var filteredBookings = bookings.Where(b => b.OrderDate >= startDate && b.OrderDate<= endDate).ToList();

        var response = new CafeAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalTransactions = filteredBookings.Count,
            SuccessfulTransactions = filteredBookings.Count(b => b.IsPaid),
            PendingTransactions = filteredBookings.Count(b => !b.IsPaid),

            TotalRevenue = filteredBookings.Where(b => b.IsPaid).Sum(b => b.DiscountedTotalAmount),
            PendingRevenue = filteredBookings.Where(b => !b.IsPaid).Sum(b => b.DiscountedTotalAmount),

            CashRevenue = filteredBookings.Where(b => b.PaymentMethod == PaymentType.Cash && b.IsPaid).Sum(b => b.DiscountedTotalAmount),
            CreditCardRevenue = filteredBookings.Where(b => b.PaymentMethod == PaymentType.CreditCard && b.IsPaid).Sum(b => b.DiscountedTotalAmount),
            OnlinePaymentRevenue = filteredBookings.Where(b => b.PaymentMethod == PaymentType.OnlinePayment && b.IsPaid).Sum(b => b.DiscountedTotalAmount),
            PayPalRevenue = 0,
        };

        return response;
    }
}