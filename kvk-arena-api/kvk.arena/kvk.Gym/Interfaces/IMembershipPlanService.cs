using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.MembershipPlans;

namespace kvk.Gym.Services;

public interface IMembershipPlanService
{
    Task<Result> CreateAsync(MembershipPlanCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(Guid id, MembershipPlanUpdateRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> GetAllAsync(CancellationToken cancellationToken = default);
}

