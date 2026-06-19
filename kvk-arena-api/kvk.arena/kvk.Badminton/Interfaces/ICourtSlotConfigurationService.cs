using kvk.Badminton.Features.CourtSlotConfiguration;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Interfaces;

public interface ICourtSlotConfigurationService
{
    Task<CourtSlotConfigurationResponse> GetByCourtIdAsync(Guid courtId, CancellationToken cancellationToken = default);
    Task<Result> CreateAsync(CourtSlotConfigurationCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(CourtSlotConfigurationUpdateRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
