using kvk.BuildingBlocks.Common;
using kvk.Gaming.Interfaces; 
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Features.GamingCategory;

public class GamingCategoryService : IGamingCategoryService
{
    private readonly GamingDbContext _db;

    public GamingCategoryService(GamingDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(GamingCategoryCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        if (string.IsNullOrWhiteSpace(request.Code))
            return Result.Failure("Code is required.");

        request.Code = request.Code.ToUpperInvariant();

        if (await _db.GamingCategories.AnyAsync(gc => gc.Name == request.Name, cancellationToken))
            return Result.Failure($"Gaming category with name '{request.Name}' already exists.");

        if (await _db.GamingCategories.AnyAsync(gc => gc.Code == request.Code, cancellationToken))
            return Result.Failure($"Gaming category with code '{request.Code}' already exists.");

        try
        {
            var gamingCategory = new Domain.GamingCategory
            {
                Name = request.Name,
                Code = request.Code,
                IsActive = true // New categories are active by default
            };

            _db.GamingCategories.Add(gamingCategory);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GamingCategoryResponse
            {
                Id = gamingCategory.Id,
                Name = gamingCategory.Name,
                Code = gamingCategory.Code,
                IsActive = gamingCategory.IsActive,
                CreatedAt = gamingCategory.CreatedAt,
                LastModifiedAt = gamingCategory.LastModifiedAt
            };

            return Result.Success("Gaming category created successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create gaming category: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(GamingCategoryUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.Id == Guid.Empty)
            return Result.Failure("Id is required.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        if (string.IsNullOrWhiteSpace(request.Code))
            return Result.Failure("Code is required.");

        request.Code = request.Code.ToUpperInvariant();

        var existingCategory = await _db.GamingCategories.FindAsync(new object[] { request.Id }, cancellationToken);

        if (existingCategory == null)
            return Result.Failure($"Gaming category with ID '{request.Id}' not found.");

        if (await _db.GamingCategories.AnyAsync(gc => gc.Id != request.Id && gc.Name == request.Name, cancellationToken))
            return Result.Failure($"Gaming category with name '{request.Name}' already exists.");

        if (await _db.GamingCategories.AnyAsync(gc => gc.Id != request.Id && gc.Code == request.Code, cancellationToken))
            return Result.Failure($"Gaming category with code '{request.Code}' already exists.");

        try
        {
            existingCategory.Name = request.Name;
            existingCategory.Code = request.Code;
            existingCategory.IsActive = request.IsActive;

            _db.GamingCategories.Update(existingCategory);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GamingCategoryResponse
            {
                Id = existingCategory.Id,
                Name = existingCategory.Name,
                Code = existingCategory.Code,
                IsActive = existingCategory.IsActive,
                CreatedAt = existingCategory.CreatedAt,
                LastModifiedAt = existingCategory.LastModifiedAt
            };

            return Result.Success("Gaming category updated successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update gaming category: {ex.Message}");
        }
    }

    public async Task<GamingCategoryResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var gamingCategory = await _db.GamingCategories
            .AsNoTracking()
            .SingleOrDefaultAsync(gc => gc.Id == id, cancellationToken);

        if (gamingCategory == null)
            return null;

        return new GamingCategoryResponse
        {
            Id = gamingCategory.Id,
            Name = gamingCategory.Name,
            Code = gamingCategory.Code,
            IsActive = gamingCategory.IsActive,
            CreatedAt = gamingCategory.CreatedAt,
            LastModifiedAt = gamingCategory.LastModifiedAt
        };
    }

    public async Task<List<GamingCategoryResponse>> GetGameCategoryListAsync(GamingCategoryPagedRequest request, CancellationToken cancellationToken = default)
    {
        var gamingCategories = await _db.GamingCategories.AsNoTracking()
            .ToListAsync(cancellationToken);

        var responses = gamingCategories.Select(gc => new GamingCategoryResponse
        {
            Id = gc.Id,
            Name = gc.Name,
            Code = gc.Code,
            IsActive = gc.IsActive,
            CreatedAt = gc.CreatedAt,
            LastModifiedAt = gc.LastModifiedAt
        }).ToList();

        return responses;
    }

    public async Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var gamingCategory = await _db.GamingCategories.FindAsync(new object[] { id }, cancellationToken);

        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{id}' not found.");

        // Prevent deleting categories that are referenced by Gaming Stations or Games.
        // This requires checking related entities.
        var hasGamingStations = await _db.GamingStations.AnyAsync(gs => gs.GamingCategoryId == id, cancellationToken);
        // var hasGames = await _db.Games.AnyAsync(g => g.GamingCategoryId == id, cancellationToken);

        if (hasGamingStations )
        {
            return Result.Failure("Cannot delete gaming category as it is referenced by existing gaming stations.");
        }

        try
        {
            gamingCategory.IsActive = false; // Soft delete by setting IsActive to false
            _db.GamingCategories.Update(gamingCategory);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Gaming category soft deleted successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to soft delete gaming category: {ex.Message}");
        }
    }

    public async Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var gamingCategory = await _db.GamingCategories.FindAsync(new object[] { id }, cancellationToken);

        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{id}' not found.");

        if (gamingCategory.IsActive)
            return Result.Failure("Gaming category is already active.");

        try
        {
            gamingCategory.IsActive = true;
            _db.GamingCategories.Update(gamingCategory);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Gaming category activated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to activate gaming category: {ex.Message}");
        }
    }

    public async Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var gamingCategory = await _db.GamingCategories.FindAsync(new object[] { id }, cancellationToken);

        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{id}' not found.");

        if (!gamingCategory.IsActive)
            return Result.Failure("Gaming category is already inactive.");

        try
        {
            gamingCategory.IsActive = false;
            _db.GamingCategories.Update(gamingCategory);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Gaming category deactivated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to deactivate gaming category: {ex.Message}");
        }
    }
}