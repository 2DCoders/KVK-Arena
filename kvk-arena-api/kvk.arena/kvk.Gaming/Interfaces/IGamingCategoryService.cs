using kvk.BuildingBlocks.Common;
using kvk.Gaming.Features.GamingCategory;

namespace kvk.Gaming.Interfaces;

public interface IGamingCategoryService
{
    Task<Result> CreateAsync(GamingCategoryCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateAsync(GamingCategoryUpdateRequest request, CancellationToken cancellationToken = default);
    Task<GamingCategoryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<GamingCategoryResponse>> GetGameCategoryListAsync(GamingCategoryPagedRequest request, CancellationToken cancellationToken = default);
    Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default);
}
