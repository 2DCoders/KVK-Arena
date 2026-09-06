using kvk.BuildingBlocks.Common;
using Kvk.Cafe;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
// For SaloonDbContext

namespace kvk.Saloon.Features.SaloonSlotConfiguration;

public class SaloonSlotConfigurationService : ISaloonSlotConfigurationService
{
    private readonly SaloonDbContext _db;

    public SaloonSlotConfigurationService(SaloonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<SaloonSlotConfigurationResponse>> GetAllAsync(Guid saloonId, CancellationToken cancellationToken = default)
    {
        return await _db.SaloonSlotConfigurations
            .AsNoTracking()
            .Where(s => s.SaloonId == saloonId)
            .OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
            .Select(s => new SaloonSlotConfigurationResponse
            {
                Id = s.Id,
                SaloonId = s.SaloonId,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                SlotIntervalMinutes = s.SlotIntervalMinutes,
                MaxBookingsPerSlot = s.MaxBookingsPerSlot,
                IsActive = s.IsActive,

            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SaloonSlotConfigurationResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var config = await _db.SaloonSlotConfigurations
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (config == null)
                throw new KeyNotFoundException("Configuration not found");

            return MapToResponse(config);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get configuration: {ex.Message}");
        }
    }

    public async Task<Result> CreateAsync(SaloonSlotConfigurationCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.SaloonId == Guid.Empty)
            return Result.Failure("Saloon ID is required");

        if (request.EndTime <= request.StartTime)
            return Result.Failure("End time must be after start time");

        try
        {
            var config = new Domain.SaloonSlotConfiguration
            {
                SaloonId = request.SaloonId,
                DayOfWeek = request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                SlotIntervalMinutes = request.SlotIntervalMinutes,
                MaxBookingsPerSlot = request.MaxBookingsPerSlot,
                IsActive = request.IsActive
            };

            _db.Set<Domain.SaloonSlotConfiguration>().Add(config);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Configuration created successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create configuration: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(SaloonSlotConfigurationUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.EndTime <= request.StartTime)
            return Result.Failure("End time must be after start time");
            
        if (request.SlotIntervalMinutes <= 0)
            return Result.Failure("Slot interval must be greater than 0");

        try
        {
            var config = await _db.SaloonSlotConfigurations
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (config == null)
                return Result.Failure("Configuration not found");

            config.DayOfWeek = request.DayOfWeek;
            config.StartTime = request.StartTime;
            config.EndTime = request.EndTime;
            config.SlotIntervalMinutes = request.SlotIntervalMinutes;
            config.MaxBookingsPerSlot = request.MaxBookingsPerSlot;
            config.IsActive = request.IsActive;

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Configuration updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update configuration: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var config = await _db.SaloonSlotConfigurations
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (config == null)
                return Result.Failure("Configuration not found");

            _db.SaloonSlotConfigurations.Remove(config);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Configuration deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete configuration: {ex.Message}");
        }
    }

    private static SaloonSlotConfigurationResponse MapToResponse(Domain.SaloonSlotConfiguration config)
    {
        return new SaloonSlotConfigurationResponse
        {
            Id = config.Id,
            SaloonId = config.SaloonId,
            DayOfWeek = config.DayOfWeek,
            StartTime = config.StartTime,
            EndTime = config.EndTime,
            SlotIntervalMinutes = config.SlotIntervalMinutes,
            MaxBookingsPerSlot = config.MaxBookingsPerSlot,
            IsActive = config.IsActive,
        };
    }
}