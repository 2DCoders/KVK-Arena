using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Features.AdditionalPurchase;

public class AdditionalPurchaseService : IAdditionalPurchaseService
{
    private readonly GamingDbContext _db;

    public AdditionalPurchaseService(GamingDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(AdditionalPurchaseCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        var categoryExists = await _db.GamingCategories.AnyAsync(gc => gc.Id == request.GamingCategoryId, cancellationToken);
        if (!categoryExists)
            return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");

        if (await _db.AdditionalPurchases.AnyAsync(ap => ap.Name == request.Name && ap.GamingCategoryId == request.GamingCategoryId, cancellationToken))
            return Result.Failure($"Additional purchase with name '{request.Name}' already exists in this category.");

        try
        {
            var additionalPurchase = new Domain.AdditionalPurchase
            {
                Name = request.Name,
                Price = request.Price,
                Description = request.Description,
                Image = request.Image,
                GamingCategoryId = request.GamingCategoryId,
                IsActive = true // Active by default
            };

            _db.AdditionalPurchases.Add(additionalPurchase);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new AdditionalPurchaseResponse
            {
                Id = additionalPurchase.Id,
                Name = additionalPurchase.Name,
                Price = additionalPurchase.Price,
                Description = additionalPurchase.Description,
                Image = additionalPurchase.Image,
                GamingCategoryId = additionalPurchase.GamingCategoryId,
                IsActive = additionalPurchase.IsActive,
                CreatedAt = additionalPurchase.CreatedAt,
                LastModifiedAt = additionalPurchase.LastModifiedAt
            };

            return Result.Success("Additional purchase created successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create additional purchase: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(AdditionalPurchaseUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.Id == Guid.Empty)
            return Result.Failure("Id is required.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        var existingPurchase = await _db.AdditionalPurchases.FindAsync(new object[] { request.Id }, cancellationToken);

        if (existingPurchase == null)
            return Result.Failure($"Additional purchase with ID '{request.Id}' not found.");

        if (existingPurchase.GamingCategoryId != request.GamingCategoryId)
        {
            var categoryExists = await _db.GamingCategories.AnyAsync(gc => gc.Id == request.GamingCategoryId, cancellationToken);
            if (!categoryExists)
                return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");
        }

        if (await _db.AdditionalPurchases.AnyAsync(ap => ap.Id != request.Id && ap.Name == request.Name && ap.GamingCategoryId == request.GamingCategoryId, cancellationToken))
            return Result.Failure($"Additional purchase with name '{request.Name}' already exists in this category.");

        try
        {
            existingPurchase.Name = request.Name;
            existingPurchase.Price = request.Price;
            existingPurchase.Description = request.Description;
            existingPurchase.Image = request.Image;
            existingPurchase.GamingCategoryId = request.GamingCategoryId;
            existingPurchase.IsActive = request.IsActive;

            _db.AdditionalPurchases.Update(existingPurchase);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new AdditionalPurchaseResponse
            {
                Id = existingPurchase.Id,
                Name = existingPurchase.Name,
                Price = existingPurchase.Price,
                Description = existingPurchase.Description,
                Image = existingPurchase.Image,
                GamingCategoryId = existingPurchase.GamingCategoryId,
                IsActive = existingPurchase.IsActive,
                CreatedAt = existingPurchase.CreatedAt,
                LastModifiedAt = existingPurchase.LastModifiedAt
            };

            return Result.Success("Additional purchase updated successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update additional purchase: {ex.Message}");
        }
    }

    public async Task<AdditionalPurchaseResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var additionalPurchase = await _db.AdditionalPurchases
            .AsNoTracking()
            .SingleOrDefaultAsync(ap => ap.Id == id, cancellationToken);

        if (additionalPurchase == null)
            return null;

        return new AdditionalPurchaseResponse
        {
            Id = additionalPurchase.Id,
            Name = additionalPurchase.Name,
            Price = additionalPurchase.Price,
            Description = additionalPurchase.Description,
            Image = additionalPurchase.Image,
            GamingCategoryId = additionalPurchase.GamingCategoryId,
            IsActive = additionalPurchase.IsActive,
            CreatedAt = additionalPurchase.CreatedAt,
            LastModifiedAt = additionalPurchase.LastModifiedAt
        };
    }

    public async Task<List<AdditionalPurchaseResponse>> GetPagedListAsync(AdditionalPurchasePagedRequest request, CancellationToken cancellationToken = default)
    {
        var purchases = await _db.AdditionalPurchases.AsNoTracking()
            .ToListAsync(cancellationToken);

        return purchases.Select(ap => new AdditionalPurchaseResponse
        {
            Id = ap.Id,
            Name = ap.Name,
            Price = ap.Price,
            Description = ap.Description,
            Image = ap.Image,
            GamingCategoryId = ap.GamingCategoryId,
            IsActive = ap.IsActive,
            CreatedAt = ap.CreatedAt,
            LastModifiedAt = ap.LastModifiedAt
        }).ToList();
    }

    public async Task<List<AdditionalPurchaseResponse>> GetByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        if (categoryId == Guid.Empty)
            return new List<AdditionalPurchaseResponse>();

        var purchases = await _db.AdditionalPurchases
            .AsNoTracking()
            .Where(ap => ap.GamingCategoryId == categoryId)
            .ToListAsync(cancellationToken);

        return purchases.Select(ap => new AdditionalPurchaseResponse
        {
            Id = ap.Id,
            Name = ap.Name,
            Price = ap.Price,
            Description = ap.Description,
            Image = ap.Image,
            GamingCategoryId = ap.GamingCategoryId,
            IsActive = ap.IsActive,
            CreatedAt = ap.CreatedAt,
            LastModifiedAt = ap.LastModifiedAt
        }).ToList();
    }

    public async Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var additionalPurchase = await _db.AdditionalPurchases.FindAsync(new object[] { id }, cancellationToken);

        if (additionalPurchase == null)
            return Result.Failure($"Additional purchase with ID '{id}' not found.");

        try
        {
            additionalPurchase.IsActive = false;
            _db.AdditionalPurchases.Update(additionalPurchase);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Additional purchase soft deleted successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to soft delete additional purchase: {ex.Message}");
        }
    }

    public async Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var additionalPurchase = await _db.AdditionalPurchases.FindAsync(new object[] { id }, cancellationToken);

        if (additionalPurchase == null)
            return Result.Failure($"Additional purchase with ID '{id}' not found.");

        if (additionalPurchase.IsActive)
            return Result.Failure("Additional purchase is already active.");

        try
        {
            additionalPurchase.IsActive = true;
            _db.AdditionalPurchases.Update(additionalPurchase);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Additional purchase activated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to activate additional purchase: {ex.Message}");
        }
    }

    public async Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var additionalPurchase = await _db.AdditionalPurchases.FindAsync(new object[] { id }, cancellationToken);

        if (additionalPurchase == null)
            return Result.Failure($"Additional purchase with ID '{id}' not found.");

        if (!additionalPurchase.IsActive)
            return Result.Failure("Additional purchase is already inactive.");

        try
        {
            additionalPurchase.IsActive = false;
            _db.AdditionalPurchases.Update(additionalPurchase);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Additional purchase deactivated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to deactivate additional purchase: {ex.Message}");
        }
    }
}