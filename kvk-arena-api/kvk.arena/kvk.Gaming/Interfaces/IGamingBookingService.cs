using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingBooking;

namespace kvk.Gaming.Interfaces;

public interface IGamingBookingService
{
    Task<Result> CreateGamingBookingAsync(CreateGamingBookingRequest request, CancellationToken cancellationToken = default);
    Task<Result> CancelGamingBookingAsync(CancelGamingBookingRequest request, CancellationToken cancellationToken = default);
    Task<GamingBookingResponse?> GetGamingBookingByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<GamingBookingResponse>> GetGamingBookingsListAsync(GetGamingBookingsListRequest request, CancellationToken cancellationToken = default); // Changed return type
    Task<List<GamingBookingResponse>> GetBookingsByGamingStationAsync(GetBookingsByGamingStationRequest request, CancellationToken cancellationToken = default); // Changed return type
    Task<List<GamingBookingResponse>> GetBookingsByCustomerAsync(GetBookingsByCustomerRequest request, CancellationToken cancellationToken = default); // Changed return type
}