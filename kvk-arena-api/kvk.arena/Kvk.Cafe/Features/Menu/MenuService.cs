using kvk.BuildingBlocks.Common;
using kvk.Cafe.Domain;
using Kvk.Cafe.Interfaces;
using Microsoft.EntityFrameworkCore;
using Kvk.Cafe;
using Kvk.Cafe.Enums;
using Microsoft.AspNetCore.Http;


namespace kvk.Cafe.Features.Menu;

public class MenuService(CafeDbContext db) : IMenuService
{
    public async Task<Result> CreateMenuAsync(MenuCreateRequest request, CancellationToken cancellationToken = default)
    {
        byte[] imageBytes = [];
        if (request.Image is not null && request.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
        }

        
        
        
        var newMenu = new Domain.Menu
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Image = imageBytes,
            Category = request.Category,
            Price = request.Price,
            Description = request.Description,
            IsActive = request.IsActive,
            Facts = request.Facts,
            PreparationTimeInMinutes = request.PreparationTimeInMinutes,
            Ingredients = request.Ingredients,
            PortionSize = request.PortionSize,
        };

        db.Menus.Add(newMenu);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success("Menu created successfully.");
    }

    public async Task<Result> UpdateMenuAsync(MenuUpdateRequest request, CancellationToken cancellationToken = default)
    {
        var exist = await db.Menus
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (exist is null)
            return Result.Failure($"Menu with id {request.Id} was not found.");
        
        byte[] imageBytes = [];
        if (request.Image is not null && request.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
        }

        

        exist.Name = request.Name;
        exist.Image = imageBytes;
        exist.Category = request.Category;
        exist.Price = request.Price;
        exist.Description = request.Description;
        exist.IsActive = request.IsActive;
        exist.Facts = request.Facts;
        exist.PreparationTimeInMinutes = request.PreparationTimeInMinutes;
        exist.Ingredients = request.Ingredients;
        exist.PortionSize = request.PortionSize;

        await db.SaveChangesAsync(cancellationToken);

        return Result.Success("Menu updated successfully.");
    }

    public async Task<Result> DeleteMenuAsync(Guid menuId, CancellationToken cancellationToken = default)
    {
        var exist = await db.Menus
            .FirstOrDefaultAsync(x => x.Id == menuId, cancellationToken);

        if (exist is null)
            return Result.Failure($"Menu with id {menuId} was not found.");

        db.Menus.Remove(exist);
        await db.SaveChangesAsync(cancellationToken);

        return Result.Success("Menu deleted successfully.");
    }

    public async Task<List<MenuResponse>> GetMenusAsync(CancellationToken cancellationToken = default)
    {
        return await db.Menus
            .Select(m => new MenuResponse
            {
                Id = m.Id,
                Name = m.Name,
                Image = m.Image,
                Category = m.Category,
                Price = m.Price,
                Description = m.Description,
                IsActive = m.IsActive,
                Facts = m.Facts,
                Ingredients = m.Ingredients,
                PreparationTimeInMinutes = m.PreparationTimeInMinutes,
                PortionSize = m.PortionSize
                
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<MenuResponse> GetMenuByIdAsync(Guid menuId, CancellationToken cancellationToken = default)
    {
        var menu = await db.Menus
            .Select(m => new MenuResponse
            {
                Id = m.Id,
                Name = m.Name,
                Image = m.Image,
                Category = m.Category,
                Price = m.Price,
                Description = m.Description,
                IsActive = m.IsActive,
                Facts = m.Facts,
                Ingredients = m.Ingredients,
                PreparationTimeInMinutes = m.PreparationTimeInMinutes,
                PortionSize = m.PortionSize
            })
            .FirstOrDefaultAsync(m => m.Id == menuId, cancellationToken);

        if (menu is null)
        {
            throw new KeyNotFoundException($"Menu with id {menuId} was not found.");
        }

        return menu;
    }
    
    
    public async Task<List<MenuResponse>> GetMenuByCategoryAsync(MenuCategory menuCategory,CancellationToken cancellationToken = default)
    {
        return await db.Menus
            .Select(m => new MenuResponse
            {
                Id = m.Id,
                Name = m.Name,
                Image = m.Image,
                Category = m.Category,
                Price = m.Price,
                Description = m.Description,
                IsActive = m.IsActive,
                Facts = m.Facts,
                Ingredients = m.Ingredients,
                PreparationTimeInMinutes = m.PreparationTimeInMinutes,
                PortionSize = m.PortionSize
                
            })
            .Where(x=> x.Category == menuCategory)
            .ToListAsync(cancellationToken);
    }
    
    
}