using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.Saloon;

namespace kvk.Saloon.Interfaces;

public interface ISaloonService
{
    Task<IEnumerable<SaloonResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<SaloonResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(SaloonCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
