using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.ServiceItem;

namespace kvk.Saloon.Interfaces;

public interface ISaloonServiceItemService
{
    Task<IEnumerable<SaloonServiceItemResponse>> GetAllAsync(Guid saloonId, CancellationToken cancellationToken = default);

    Task<SaloonServiceItemResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(SaloonServiceItemCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonServiceItemUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
