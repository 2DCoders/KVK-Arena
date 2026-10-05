using kvk.BuildingBlocks.Common;
using Kvk.Cafe;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
// For SaloonDbContext

namespace kvk.Saloon.Features.Saloon;

public class SaloonService : ISaloonService
{
    private readonly SaloonDbContext _db;

    public SaloonService(SaloonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<SaloonResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Saloons
            .AsNoTracking()
            .OrderBy(s => s.CreatedAt)
            .Select(s => new SaloonResponse
            {
                Id = s.Id,
                Name = s.Name,
                Description = s.Description,
                IsActive = s.IsActive,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SaloonResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var saloon = await _db.Saloons
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (saloon == null)
                throw new KeyNotFoundException("Saloon not found");

            return MapToResponse(saloon);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get saloon: {ex.Message}");
        }
    }

    public async Task<Result> CreateAsync(SaloonCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Saloon name is required");

        try
        {
            var saloon = new Domain.Saloon
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive
            };

            _db.Set<Domain.Saloon>().Add(saloon);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Saloon created successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create saloon: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(SaloonUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Saloon name is required");

        try
        {
            var saloon = await _db.Saloons
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (saloon == null)
                return Result.Failure("Saloon not found");

            saloon.Name = request.Name;
            saloon.Description = request.Description;
            saloon.IsActive = request.IsActive;

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Saloon updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update saloon: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var saloon = await _db.Saloons
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (saloon == null)
                return Result.Failure("Saloon not found");

            _db.Saloons.Remove(saloon);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Saloon deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete saloon: {ex.Message}");
        }
    }

    private static SaloonResponse MapToResponse(Domain.Saloon saloon)
    {
        return new SaloonResponse
        {
            Id = saloon.Id,
            Name = saloon.Name,
            Description = saloon.Description,
            IsActive = saloon.IsActive
        };
    }
}
