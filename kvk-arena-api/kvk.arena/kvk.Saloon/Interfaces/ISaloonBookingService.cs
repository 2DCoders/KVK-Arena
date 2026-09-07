using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.Booking;

namespace kvk.Saloon.Interfaces;

public interface ISaloonBookingService
{
    Task<IEnumerable<SaloonBookingResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<SaloonBookingResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CheckAvailabilityAsync(SaloonBookingAvailabilityRequest request, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(SaloonBookingCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonBookingUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
