using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingStationGameMapping;

namespace kvk.Gaming.Interfaces;

public interface IGamingStationGameMappingService
{
    Task<Result> AssignGamesToGamingStationAsync(AssignGamesToGamingStationRequest request, CancellationToken cancellationToken = default);
    Task<Result> ReplaceGamesForGamingStationAsync(ReplaceGamesForGamingStationRequest request, CancellationToken cancellationToken = default);
    Task<Result> RemoveGameFromGamingStationAsync(RemoveGameFromGamingStationRequest request, CancellationToken cancellationToken = default);
    Task<List<GamingStationGameMappingResponse>> GetGamesByGamingStationAsync(Guid gamingStationId, CancellationToken cancellationToken = default);
    Task<List<GamingStationGameMappingResponse>> GetGamingStationsByGameAsync(Guid gameId, CancellationToken cancellationToken = default);
}