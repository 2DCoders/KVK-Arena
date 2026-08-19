using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Features.KvkMember;

public interface IKvkMemberService
{

    Task<Result> RegisterAsync(KvkMemberRegisterRequest request,CancellationToken cancellationToken);
    
    Task<List<KvkMemberResponse>> GetMembersAsync(CancellationToken cancellationToken);
    
    Task<KvkMemberResponse> GetMemberByIdAsync(Guid id,CancellationToken cancellationToken);
    
    Task<Result> DeleteMemberAsync(Guid id,CancellationToken cancellationToken);
    
    Task<Result> RecordMemberAsPaidAsync(MemberPayRequest request,CancellationToken cancellationToken);
    
    Task<Result> ActiveOrDeactivateMemberAsync(Guid id,bool isActive,CancellationToken cancellationToken);
    
    Task<Result> SendSmsCouponCodeBulkAsync(CancellationToken cancellationToken);
    
    Task<Result> SendSmsCouponCodeSingleAsync(string memberId,CancellationToken cancellationToken);
}