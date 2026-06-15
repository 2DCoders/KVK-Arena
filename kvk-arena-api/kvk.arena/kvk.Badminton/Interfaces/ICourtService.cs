using kvk.Badminton.Features.Court;
using kvk.BuildingBlocks.Common;

namespace kvk.Badminton.Interfaces;

public interface ICourtService
{
    Task<IEnumerable<CourtResponse>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<CourtResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> CreateAsync(CourtCreateRequest request, CancellationToken cancellationToken = default);

    Task<Result> UpdateAsync(CourtUpdateRequest request, CancellationToken cancellationToken = default);

    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}