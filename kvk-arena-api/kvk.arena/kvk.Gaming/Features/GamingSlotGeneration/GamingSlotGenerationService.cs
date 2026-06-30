using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming;
using kvk.Gaming.Enums;
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
            return Result.Failure("Gaming Category ID is required.");

        var gamingCategory = await _db.GamingCategories
            .SingleOrDefaultAsync(gs => gs.Id == request.GamingCategoryId, cancellationToken);

        if (gamingCategory == null)
            return Result.Failure("Gaming Category not found.");

        if (!gamingCategory.IsActive)
            return Result.Failure($"Gaming Category '{gamingCategory.Name}' is inactive. Cannot generate slots.");

        try
        {
            var config = new Domain.GamingSlotConfiguration
            {
                GamingCategoryId = request.GamingCategoryId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                SlotDurationMinutes = request.SlotDurationMinutes,
                SlotGapMinutes = request.SlotGapMinutes,
                Price = request.Price, 
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
            config.Price = request.Price; // Corrected to use request.Price

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

            // When config is deleted, we should clear the generated slots associated with it
            var existingSlots = await _db.GamingSlots
                .Where(x => x.GamingCategoryId == config.GamingCategoryId)
                .ToListAsync(cancellationToken);
            
            _db.GamingSlots.RemoveRange(existingSlots);

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
        
        //and check with CourtBookingHold also
        var bookingHoldNotExpired = await _db.GamingBookingHolds
            .AsNoTracking()
            .Where(b => b.GamingStationId == stationId &&
                        b.GamingCategoryId == categoryId &&
                        b.BookingDate == date &&
                        b.Status == GamingBookingHoldStatus.Pending &&
                        b.ExpiresAt > DateTime.Now)
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
            IsBooked = bookedSlotsIds.Contains(slot.Id) || bookingHoldNotExpired.Contains(slot.Id),
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
                Price = config.Price, // Corrected to use config.Price
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
        // 1. Get all active gaming stations for the category
        var gamingStations = await _db.GamingStations
            .Where(gs => gs.GamingCategoryId == config.GamingCategoryId && gs.IsActive)
            .ToListAsync(cancellationToken);

        // 2. Delete old slots for all stations in this category
        var oldSlots = await _db.GamingSlots
            .Where(x => x.GamingCategoryId == config.GamingCategoryId)
            .ToListAsync(cancellationToken);

        _db.GamingSlots.RemoveRange(oldSlots);

        // 3. Generate new slots for each gaming station
        var newSlots = new List<GamingSlot>();

        foreach (var station in gamingStations)
        {
            var currentTime = config.StartTime;

            // Simple safety check to prevent infinite loops if end time is before start time or duration is 0
            while (currentTime.AddMinutes(config.SlotDurationMinutes) <= config.EndTime)
            {
                var slotEndTime = currentTime.AddMinutes(config.SlotDurationMinutes);

                newSlots.Add(new GamingSlot
                {
                    GamingCategoryId = config.GamingCategoryId,
                    GamingSlotConfigurationId = config.Id, // Assign the configuration ID to satisfy the foreign key
                    GamingStationId = station.Id, // Assign the station ID
                    StartTime = currentTime,
                    EndTime = slotEndTime,
                    IsActive = true,
                    Price = config.Price // Corrected to use config.Price
                });

                currentTime = slotEndTime.AddMinutes(config.SlotGapMinutes);

                // Prevent infinite loop if crossing midnight (though TimeOnly handles 24h)
                if (currentTime < slotEndTime) break;
            }
        }

        if (newSlots.Any())
        {
            _db.GamingSlots.AddRange(newSlots);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}