using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingSlotGeneration;

namespace kvk.Gaming.Interfaces;

public interface IGamingSlotGenerationService
{
    Task<Result> GenerateSlotsForGamingCategoryeAsync(GamingCategorySlotConfigurationRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(GamingSlotConfigurationUpdateRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
