using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingSlotConfiguration;

namespace kvk.Gaming.Interfaces;

public interface IGamingSlotConfigurationService
{
    Task<Result> CreateAsync(GamingSlotConfigurationCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(GamingSlotConfigurationUpdateRequests requests, CancellationToken cancellationToken = default);
    Task<List<GamingSlotConfigurationResponse>> GetByGamingStationAsync(Guid gamingStationId, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}