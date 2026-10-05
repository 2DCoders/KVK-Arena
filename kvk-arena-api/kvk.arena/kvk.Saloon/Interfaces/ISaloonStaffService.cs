using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.Staff;

namespace kvk.Saloon.Interfaces;

public interface ISaloonStaffService
{
    Task<IEnumerable<SaloonStaffResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<SaloonStaffResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(SaloonStaffCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonStaffUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
