using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.Game;

namespace kvk.Gaming.Interfaces;

public interface IGameService
{
    Task<Result> CreateAsync(GameCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(GameUpdateRequest request, CancellationToken cancellationToken = default);
    Task<GameResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<GameResponse>> GetListAsync(GameListRequest request, CancellationToken cancellationToken = default);
    Task<List<GameResponse>> GetGamesByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}
