using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.StaffSchedule;

namespace kvk.Saloon.Interfaces;

public interface ISaloonStaffScheduleService
{
    Task<IEnumerable<SaloonStaffScheduleResponse>> GetAllAsync(Guid staffId, CancellationToken cancellationToken = default);

    Task<SaloonStaffScheduleResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(SaloonStaffScheduleCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonStaffScheduleUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
