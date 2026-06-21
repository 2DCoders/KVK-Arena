using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingStation;

namespace kvk.Gaming.Interfaces;

public interface IGamingStationService
{
    Task<Result> CreateAsync(GamingStationCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(GamingStationUpdateRequest request, CancellationToken cancellationToken = default);
    Task<GamingStationResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<GamingStationResponse>> GetListAsync(GamingStationListRequest request, CancellationToken cancellationToken = default);
    Task<List<GamingStationResponse>> GetStationsByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}