using kvk.BuildingBlocks.Common;
using kvk.Saloon.Features.BusinessHours;

namespace kvk.Saloon.Interfaces;

public interface ISaloonBusinessHoursService
{
    Task<SaloonBusinessHoursResponse> GetAsync(CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(SaloonBusinessHoursUpdateRequest request, CancellationToken cancellationToken = default);
}
