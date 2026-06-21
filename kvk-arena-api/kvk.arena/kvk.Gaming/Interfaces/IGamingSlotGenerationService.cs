using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingSlotGeneration;

namespace kvk.Gaming.Interfaces;

public interface IGamingSlotGenerationService
{
    Task<Result> GenerateSlotsForSpecificDateAsync(GenerateSlotsForDateRequest request, CancellationToken cancellationToken = default);
    Task<Result> GenerateSlotsForDateRangeAsync(GenerateSlotsForDateRangeRequest request, CancellationToken cancellationToken = default);
    Task<Result> RegenerateSlotsForGamingStationAsync(RegenerateSlotsForStationRequest request, CancellationToken cancellationToken = default);
    Task<Result> DisableGeneratedSlotsForDateAsync(DisableGeneratedSlotsForDateRequest request, CancellationToken cancellationToken = default);
    Task<List<GamingSlotResponse>> GetSlotsByGamingStationAndDateAsync(GetSlotsByStationAndDateRequest request, CancellationToken cancellationToken = default);
}