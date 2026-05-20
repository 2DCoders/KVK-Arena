using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.Memberships;

namespace kvk.Gym.Services;

public interface IMembershipService
{
    Task<Result> CreateMemberAsync(CreateMembershipRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateFingerprintsAsync(Guid memberId, UpdateFingerprintsRequest request, CancellationToken cancellationToken = default);
    
    Task<List<MembershipResponse>> GetAllMembersAsync(CancellationToken cancellationToken = default);
    
    Task<Result> GetMemberAsync(Guid memberId, CancellationToken cancellationToken = default);
    Task<Result> EnsureMembershipForStaffAsync(string identityUserId, string email, string fullName, CancellationToken cancellationToken = default);
}
