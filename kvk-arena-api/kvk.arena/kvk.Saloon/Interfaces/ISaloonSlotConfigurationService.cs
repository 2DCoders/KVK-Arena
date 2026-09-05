using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.SaloonSlotConfiguration;

namespace kvk.Saloon.Interfaces;

public interface ISaloonSlotConfigurationService
{
    Task<IEnumerable<SaloonSlotConfigurationResponse>> GetAllAsync(Guid saloonId, CancellationToken cancellationToken = default);

    Task<SaloonSlotConfigurationResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(SaloonSlotConfigurationCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonSlotConfigurationUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
