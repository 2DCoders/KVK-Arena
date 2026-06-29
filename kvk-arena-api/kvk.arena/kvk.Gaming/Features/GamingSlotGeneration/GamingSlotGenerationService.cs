using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming;
using kvk.Gaming.Features.GamingSlotConfiguration;
using kvk.Gaming.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Features.GamingSlotGeneration;

public class GamingSlotGenerationService : IGamingSlotGenerationService
{
    private readonly GamingDbContext _db;

    public GamingSlotGenerationService(GamingDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> GenerateSlotsForGamingCategoryeAsync(GamingCategorySlotConfigurationRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingCategoryId == Guid.Empty)
            return Result.Failure("Gaming Station ID is required.");

        var gamingCategories = await _db.GamingCategories
            .SingleOrDefaultAsync(gs => gs.Id == request.GamingCategoryId, cancellationToken);

        if (!gamingCategories.IsActive)
            return Result.Failure($"Gaming Station '{gamingCategories.Name}' is inactive. Cannot generate slots.");

        try
        {
            var config = new Domain.GamingSlotConfiguration
            {
                GamingCategoryId = request.GamingCategoryId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                SlotDurationMinutes = request.SlotDurationMinutes,
                SlotGapMinutes = request.SlotGapMinutes,
                IsActive = request.IsActive ?? 0
            };

            _db.GamingSlotConfigurations.Add(config);
            await _db.SaveChangesAsync(cancellationToken);

            await RegenerateSlotsInternalAsync(config, cancellationToken);

            return Result.Success("Configuration created and slots generated");
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<Result> UpdateAsync(GamingSlotGenerationConfigurationUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = await _db.GamingSlotConfigurations
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (config == null) return Result.Failure("Configuration not found");

            config.StartTime = request.StartTime;
            config.EndTime = request.EndTime;
            config.SlotDurationMinutes = request.SlotDurationMinutes;
            config.SlotGapMinutes = request.SlotGapMinutes;
            config.IsActive = request.IsActive;
            config.GamingCategoryId = request.GamingCategoryId;

            await _db.SaveChangesAsync(cancellationToken);

            await RegenerateSlotsInternalAsync(config, cancellationToken);

            return Result.Success("Configuration updated and slots regenerated");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update configuration: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var config = await _db.GamingSlotConfigurations
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (config == null) return Result.Failure("Configuration not found");

            // When config is deleted, we should probably clear the generated slots too
            var existingSlots = _db.GamingSlotConfigurations.Where(x => x.GamingCategoryId == config.GamingCategoryId);
            _db.GamingSlotConfigurations.RemoveRange(existingSlots);

            _db.GamingSlotConfigurations.Remove(config);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Configuration and associated slots deleted");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete configuration: {ex.Message}");
        }
    }

    public async Task<IEnumerable<GameSlotResponse>> GetByStationCategoryIdAndDate(Guid stationId, Guid categoryId,
        DateOnly date,
        CancellationToken cancellationToken = default)
    {
        var allAvailableSlots = await _db.GamingSlots
            .AsNoTracking()
            .Where(x => x.GamingCategoryId == categoryId && x.GamingStationId == stationId)
            .OrderBy(x => x.StartTime)
            .ToListAsync(cancellationToken);

        var bookedSlotsIds = await _db.GamingBookings
            .AsNoTracking()
            .Where(b => b.GamingStationId == stationId &&
                        b.BookingDate == date && b.GamingCategoryId == categoryId)
            .Select(x => x.GamingSlotId)
            .ToListAsync(cancellationToken);

        return allAvailableSlots.Select(slot => new GameSlotResponse
        {
            Id = slot.Id,
            StationId = slot.GamingStationId,
            CategoryId = slot.GamingCategoryId,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsActive = slot.IsActive,
            Price = slot.Price,
            IsBooked = bookedSlotsIds.Contains(slot.Id),
            CreatedAt = slot.CreatedAt,
            LastModifiedAt = slot.LastModifiedAt
        });
    }

    public async Task<GamingSlotConfigurationResponse?> GetConfigurationByCategory(Guid categoryId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var config = await _db.GamingSlotConfigurations
                .FirstOrDefaultAsync(x => x.GamingCategoryId == categoryId, cancellationToken);

            if (config == null)
            {
                throw new Exception($"No configuration found for Gaming Category ID: {categoryId}");
            }

            return new GamingSlotConfigurationResponse
            {
                Id = config.Id,
                GamingCategoryName =
                    (await _db.GamingCategories.FindAsync(new object[] { categoryId }, cancellationToken))?.Name ??
                    string.Empty,
                StartTime = config.StartTime,
                EndTime = config.EndTime,
                SlotDurationMinutes = config.SlotDurationMinutes,
                SlotGapMinutes = config.SlotGapMinutes,
                Price = config.IsActive ?? 0,
                IsActive = config.IsActive > 0,
                CreatedAt = config.CreatedAt,
                LastModifiedAt = config.LastModifiedAt
            };
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    private async Task RegenerateSlotsInternalAsync(Domain.GamingSlotConfiguration config,
        CancellationToken cancellationToken)
    {
        // 1. Delete old slots
        var oldSlots = await _db.GamingSlots
            .Where(x => x.GamingCategoryId == config.GamingCategoryId)
            .ToListAsync(cancellationToken);

        _db.GamingSlots.RemoveRange(oldSlots);

        // 2. Generate new slots
        var newSlots = new List<GamingSlot>();
        var currentTime = config.StartTime;

        // Simple safety check to prevent infinite loops if end time is before start time or duration is 0
        while (currentTime.AddMinutes(config.SlotDurationMinutes) <= config.EndTime)
        {
            var slotEndTime = currentTime.AddMinutes(config.SlotDurationMinutes);

            newSlots.Add(new GamingSlot
            {
                GamingCategoryId = config.GamingCategoryId,
                StartTime = currentTime,
                EndTime = slotEndTime,
                IsActive = true,
                // Using the 'IsActive' decimal from config as price if available, else 0
                Price = config.IsActive ?? 0
            });

            currentTime = slotEndTime.AddMinutes(config.SlotGapMinutes);

            // Prevent infinite loop if crossing midnight (though TimeOnly handles 24h)
            if (currentTime < slotEndTime) break;
        }

        if (newSlots.Any())
        {
            _db.GamingSlots.AddRange(newSlots);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}