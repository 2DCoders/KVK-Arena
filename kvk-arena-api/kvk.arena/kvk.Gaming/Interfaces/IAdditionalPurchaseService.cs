using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.AdditionalPurchase;

namespace kvk.Gaming.Interfaces;

public interface IAdditionalPurchaseService
{
    Task<Result> CreateAsync(AdditionalPurchaseCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(AdditionalPurchaseUpdateRequest request, CancellationToken cancellationToken = default);
    Task<AdditionalPurchaseResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<AdditionalPurchaseResponse>> GetPagedListAsync(AdditionalPurchasePagedRequest request, CancellationToken cancellationToken = default);
    Task<List<AdditionalPurchaseResponse>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default);
    Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}
