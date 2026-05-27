using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.DayPassMembers;

namespace kvk.Gym.Interfaces;

public interface IDayPassMemberService
{
    Task<Result> CreateAsync(DayPassMemberCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(Guid id, DayPassMemberUpdateRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DayPassMemberResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<DayPassMemberResponse>> GetAllAsync(CancellationToken cancellationToken = default);
}
