using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingBooking;

namespace kvk.Gaming.Interfaces;

public interface IGamingBookingService
{
    Task<Result> CreateGamingBookingAsync(CreateGamingBookingRequest request, CancellationToken cancellationToken = default);
    Task<Result> CancelGamingBookingAsync(CancelGamingBookingRequest request, CancellationToken cancellationToken = default);
    Task<GamingBookingResponse?> GetGamingBookingByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<GamingBookingResponse>> GetGamingBookingsListAsync(GetGamingBookingsListRequest request, CancellationToken cancellationToken = default);
    Task<List<GamingBookingResponse>> GetBookingsByGamingStationAsync(GetBookingsByGamingStationRequest request, CancellationToken cancellationToken = default);
    Task<List<GamingBookingResponse>> GetBookingsByCustomerAsync(GetBookingsByCustomerRequest request, CancellationToken cancellationToken = default);

    // New methods for multi-booking and payment integration
    Task<Result> CreateMultiGamingHoldAsync(MultiGamingBookingRequest request, CancellationToken cancellationToken = default);
    Task<Result> CreateSingleGamingBookingWithPaymentAsync(SingleGamingBookingWithPaymentRequest request, CancellationToken cancellationToken = default);
    Task<Result> ProcessPaymentSuccessAsync(Guid holdId, string paymentIntentId, CancellationToken cancellationToken = default);
    Task VerifyPaymentNotificationAsync(PaymentNotificationRequest request, CancellationToken cancellationToken = default);
}