using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Features.OfferRate;

public interface IOfferRateService
{
    Task<Result> CreateOfferRateAsync(OfferRateCreateRequest request,CancellationToken cancellationToken = default);

    Task<Result> UpdateOfferRateAsync(Guid id,OfferRateUpdateRequest request, CancellationToken cancellationToken = default);
    
    Task<Result> DeleteOfferRateAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<Result> ActivateOrDeactivateOfferRateAsync(Guid id,bool isActive,CancellationToken cancellationToken = default);
    
    Task<List<OfferRateResponse>> GetOfferRateListAsync(CancellationToken cancellationToken = default);
    
    Task<OfferRateResponse> GetOfferRateByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<Result> AssignOfferRateToUserAsync(Guid offerRateId,List<Guid>? memberList, CancellationToken cancellationToken = default);
    
    Task<List<MemberEligibleResponse>> GetEligibleMembersAsync(Guid? offerRateId,Guid? memberId, CancellationToken cancellationToken = default);
    
}