using kvk.Badminton.Features.Booking;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Interfaces;

public interface IBookingService
{
    Task<Result> CreateHoldAsync(BookingHoldRequest request, CancellationToken ct = default);
    Task<Result> CreateMultiHoldAsync(MultiBookingRequest request, CancellationToken ct = default);
    Task<Result> CreateSingleBookingWithPaymentAsync(SingleBookingWithPaymentRequest request, CancellationToken ct = default);
    Task<Result> CreateMultiPaymentAsync(MultiBookingPaymentRequest request, CancellationToken ct = default);
    Task<Result> ProcessPaymentSuccessAsync(Guid holdId, CustomerDetails customerDetails, string paymentIntentId, CancellationToken ct = default);
    Task<Result> ProcessMultiPaymentSuccessAsync(MultiPaymentRequest request, CancellationToken ct = default);
    Task VerifyPaymentNotificationAsync(PaymentNotificationRequest request, CancellationToken ct = default);
    Task<Result> CleanupExpiredHoldsAsync(CancellationToken ct = default);
    Task<Result> DeletePendingPayment(BadmintonPendingPaymentDeleteRequest request, CancellationToken ct = default);
    Task<List<BookingListResponse>> GetBookingsListAsync(GetBookingsListRequest request, CancellationToken ct = default);
    Task<Result> FixStalePendingBookingsAsync(CancellationToken ct = default);
}