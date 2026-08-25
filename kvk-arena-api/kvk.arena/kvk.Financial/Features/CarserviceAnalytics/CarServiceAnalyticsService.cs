using kvk.CarService;
using kvk.CarService.Domain;
using kvk.Financial.Features.BadmintonAnalytics;
using Microsoft.EntityFrameworkCore;

namespace kvk.Financial.Features.CarserviceAnalytics;

public class CarServiceAnalyticsService
{
    private readonly CarServiceDbContext _context;

    public CarServiceAnalyticsService(CarServiceDbContext context)
    {
        _context = context;
    }

    public async Task<CarServiceAnalyticsResponse> GetAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
    {
        var bookings = await _context.CarWashOrders.ToListAsync(cancellationToken);

        var filteredBookings = bookings.Where(b => b.OrderDate >= startDate && b.OrderDate<= endDate).ToList();

        var response = new CarServiceAnalyticsResponse
        {
            StartDate = startDate,
            EndDate = endDate,
            TotalTransactions = filteredBookings.Count,
            SuccessfulTransactions = filteredBookings.Count(b => b.CarWashOrderStatus == CarWashOrderStatus.Completed),
            PendingTransactions = filteredBookings.Count(b => b.CarWashOrderStatus == CarWashOrderStatus.Pending),
            CancelledTransactions = filteredBookings.Count(b => b.CarWashOrderStatus == CarWashOrderStatus.Cancelled),

            TotalRevenue = filteredBookings.Where(b => b.CarWashOrderStatus == CarWashOrderStatus.Completed).Sum(b => b.DiscountedTotalAmount),
            PendingRevenue = filteredBookings.Where(b => b.CarWashOrderStatus == CarWashOrderStatus.Pending).Sum(b => b.DiscountedTotalAmount),
            CancelledRevenue = filteredBookings.Where(b => b.CarWashOrderStatus == CarWashOrderStatus.Cancelled).Sum(b => b.DiscountedTotalAmount),

            CashRevenue = filteredBookings.Where(b => b.PaymentMethod == PaymentMethod.Cash && b.CarWashOrderStatus == CarWashOrderStatus.Completed).Sum(b => b.DiscountedTotalAmount),
            CreditCardRevenue = filteredBookings.Where(b => b.PaymentMethod == PaymentMethod.Card && b.CarWashOrderStatus == CarWashOrderStatus.Completed).Sum(b => b.DiscountedTotalAmount),
            OnlinePaymentRevenue = filteredBookings.Where(b => b.PaymentMethod == PaymentMethod.Online && b.CarWashOrderStatus == CarWashOrderStatus.Completed).Sum(b => b.DiscountedTotalAmount),
            PayPalRevenue = 0,
        };

        return response;
    }
}