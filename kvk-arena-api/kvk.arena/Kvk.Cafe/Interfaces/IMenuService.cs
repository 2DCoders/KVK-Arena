using kvk.BuildingBlocks.Common;
using Kvk.Cafe.Enums;
using kvk.Cafe.Features.Menu;

namespace Kvk.Cafe.Interfaces;

public interface IMenuService
{
    Task<Result> CreateMenuAsync(MenuCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateMenuAsync(MenuUpdateRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteMenuAsync(Guid menuId, CancellationToken cancellationToken = default);
    Task<List<MenuResponse>> GetMenusAsync(CancellationToken cancellationToken = default);
    Task<MenuResponse> GetMenuByIdAsync(Guid menuId, CancellationToken cancellationToken = default);
    Task<List<MenuResponse>> GetMenuByCategoryAsync(MenuCategory menuCategory, CancellationToken cancellationToken = default);
}