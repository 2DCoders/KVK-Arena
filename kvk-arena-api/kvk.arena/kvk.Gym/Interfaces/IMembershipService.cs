using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.Memberships;

namespace kvk.Gym.Interfaces;

public interface IMembershipService
{
    Task<Result> CreateMemberAsync(CreateMembershipRequest request, CancellationToken cancellationToken = default);
    
    Task<MemberLoginResponse> LoginAsync(MemberLoginRequest request, CancellationToken cancellationToken = default);
    
    Task<Result> ChangePasswordAsync(Guid memberId,string oldPassword,string newPassword,CancellationToken cancellationToken = default);
    
    Task<Result> UpdateFingerprintsAsync(Guid memberId, UpdateFingerprintsRequest request, CancellationToken cancellationToken = default);
    Task<Result> EditMemberAsync(Guid memberId, EditMembershipRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpgradeMembershipPlanAsync(Guid memberId, UpgradeMembershipPlanRequest request, CancellationToken cancellationToken = default);
    
    Task<List<MembershipResponse>> GetAllMembersAsync(CancellationToken cancellationToken = default);
    
    Task<MembershipResponse> GetMemberAsync(Guid memberId, CancellationToken cancellationToken = default);
    
    // Soft delete a member (marks IsDeleted = true)
    Task<Result> SoftDeleteMemberAsync(Guid memberId, CancellationToken cancellationToken = default);

    Task<Result> ReverseSoftDeleteMemberAsync(Guid memberId, CancellationToken cancellationToken = default);

    // Permanently delete a member. Allowed only for members that meet configured criteria.
    Task<Result> PermanentlyDeleteMemberAsync(Guid memberId, CancellationToken cancellationToken = default);
    Task<Result> EnsureMembershipForStaffAsync(string identityUserId, string email, string fullName, CancellationToken cancellationToken = default);
    Task<Result> AssignTrainerAsync(Guid memberId, Guid trainerId, CancellationToken cancellationToken = default);

    Task<List<TrainerResponse>> GetAllTrainersAsync(CancellationToken cancellationToken = default);
}
