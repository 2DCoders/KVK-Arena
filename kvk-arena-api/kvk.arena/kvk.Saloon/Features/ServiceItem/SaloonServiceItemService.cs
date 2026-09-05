using kvk.BuildingBlocks.Common;
using Kvk.Cafe;
using kvk.Saloon.Domain;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
// For SaloonDbContext

namespace kvk.Saloon.Features.ServiceItem;

public class SaloonServiceItemService : ISaloonServiceItemService
{
    private readonly SaloonDbContext _db;

    public SaloonServiceItemService(SaloonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<SaloonServiceItemResponse>> GetAllAsync(Guid saloonId, CancellationToken cancellationToken = default)
    {
        return await _db.SaloonServices
            .AsNoTracking()
            .Where(s => s.SaloonId == saloonId)
            .OrderBy(s => s.CreatedAt)
            .Select(s => new SaloonServiceItemResponse
            {
                Id = s.Id,
                SaloonId = s.SaloonId,
                Name = s.Name,
                Description = s.Description,
                Price = s.Price,
                DurationMinutes = s.DurationMinutes,
                BufferMinutes = s.BufferMinutes,
                IsActive = s.IsActive,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SaloonServiceItemResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var serviceItem = await _db.SaloonServices
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (serviceItem == null)
                throw new KeyNotFoundException("Service item not found");

            return MapToResponse(serviceItem);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get service item: {ex.Message}");
        }
    }

    public async Task<Result> CreateAsync(SaloonServiceItemCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Service name is required");

        if (request.SaloonId == Guid.Empty)
            return Result.Failure("Saloon ID is required");
            
        if (request.Price < 0)
            return Result.Failure("Price cannot be negative");

        try
        {
            var serviceItem = new SaloonService
            {
                SaloonId = request.SaloonId,
                Name = request.Name,
                Description = request.Description,
                Price = request.Price,
                DurationMinutes = request.DurationMinutes,
                BufferMinutes = request.BufferMinutes,
                IsActive = request.IsActive
            };

            _db.Set<SaloonService>().Add(serviceItem);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Service item created successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create service item: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(SaloonServiceItemUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Service name is required");

        if (request.Price < 0)
            return Result.Failure("Price cannot be negative");

        try
        {
            var serviceItem = await _db.SaloonServices
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (serviceItem == null)
                return Result.Failure("Service item not found");

            serviceItem.Name = request.Name;
            serviceItem.Description = request.Description;
            serviceItem.Price = request.Price;
            serviceItem.DurationMinutes = request.DurationMinutes;
            serviceItem.BufferMinutes = request.BufferMinutes;
            serviceItem.IsActive = request.IsActive;

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Service item updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update service item: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var serviceItem = await _db.SaloonServices
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (serviceItem == null)
                return Result.Failure("Service item not found");

            _db.SaloonServices.Remove(serviceItem);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Service item deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete service item: {ex.Message}");
        }
    }

    private static SaloonServiceItemResponse MapToResponse(SaloonService serviceItem)
    {
        return new SaloonServiceItemResponse
        {
            Id = serviceItem.Id,
            SaloonId = serviceItem.SaloonId,
            Name = serviceItem.Name,
            Description = serviceItem.Description,
            Price = serviceItem.Price,
            DurationMinutes = serviceItem.DurationMinutes,
            BufferMinutes = serviceItem.BufferMinutes,
            IsActive = serviceItem.IsActive,
        };
    }
}
