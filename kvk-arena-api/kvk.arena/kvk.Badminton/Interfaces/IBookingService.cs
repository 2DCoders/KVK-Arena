using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Interfaces;

public interface IBookingService
{
    Task<Result> CreateHoldAsync(BookingHoldRequest request, CancellationToken ct = default);
    Task<Result> CreateMultiHoldAsync(MultiBookingRequest request, CancellationToken ct = default);
    Task<Result> CreateSingleBookingWithPaymentAsync(SingleBookingWithPaymentRequest request, CancellationToken ct = default);
    Task<Result> ProcessPaymentSuccessAsync(Guid holdId, CustomerDetails customerDetails, string paymentIntentId, CancellationToken ct = default);
    Task VerifyPaymentNotificationAsync(PaymentNotificationRequest request, CancellationToken ct = default);
    Task<Result> CleanupExpiredHoldsAsync(CancellationToken ct = default);
}
