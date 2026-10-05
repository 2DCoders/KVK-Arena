using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.Booking;

namespace kvk.Saloon.Interfaces;

public interface ISaloonBookingService
{
    Task<List<SaloonBookingResponse>> GetBookingsListAsync(GetSaloonBookingsListRequest request, CancellationToken cancellationToken = default);

    Task<SaloonBookingResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CheckAvailabilityAsync(SaloonBookingAvailabilityRequest request, CancellationToken cancellationToken = default);

    Task<Result> CheckDayAvailabilityAsync(SaloonDayAvailabilityRequest request, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(SaloonBookingCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> CreateWithPaymentAsync(SaloonBookingCreateRequest request, CancellationToken cancellationToken = default);

    Task VerifyPaymentNotificationAsync(kvk.BuildingBlocks.Common.PaymentNotificationRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeletePendingPayment(SaloonPendingPaymentDeleteRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonBookingUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
