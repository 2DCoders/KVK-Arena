using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming;
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

    public async Task<Result> GenerateSlotsForSpecificDateAsync(GenerateSlotsForDateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingStationId == Guid.Empty)
            return Result.Failure("Gaming Station ID is required.");

        var gamingStation = await _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .SingleOrDefaultAsync(gs => gs.Id == request.GamingStationId, cancellationToken);

        if (gamingStation == null)
            return Result.Failure($"Gaming Station with ID '{request.GamingStationId}' not found.");

        if (!gamingStation.IsActive)
            return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive. Cannot generate slots.");

        var activeConfiguration = await _db.GamingSlotConfigurations
            .Where(gsc => gsc.GamingStationId == request.GamingStationId && gsc.IsActive)
            .OrderByDescending(gsc => gsc.CreatedAt) // Get the latest active configuration
            .FirstOrDefaultAsync(cancellationToken);

        if (activeConfiguration == null)
            return Result.Failure($"No active slot configuration found for Gaming Station '{gamingStation.Name}'.");

        // Check for existing slots for the same station and date to ensure idempotency
        if (await _db.GamingSlots.AnyAsync(gs => gs.GamingStationId == request.GamingStationId && gs.Date.Date == request.Date.Date, cancellationToken))
        {
            return Result.Success($"Slots for Gaming Station '{gamingStation.Name}' on {request.Date.ToShortDateString()} already generated. Operation is idempotent.");
        }

        var generatedSlots = new List<GamingSlot>();
        var currentTime = activeConfiguration.StartTime;

        while (currentTime < activeConfiguration.EndTime)
        {
            var slotEndTime = currentTime.Add(TimeSpan.FromMinutes(activeConfiguration.SlotDurationMinutes));

            if (slotEndTime > activeConfiguration.EndTime)
            {
                break; // Slot exceeds end time
            }

            generatedSlots.Add(new GamingSlot
            {
                GamingStationId = request.GamingStationId,
                GamingSlotConfigurationId = activeConfiguration.Id,
                Date = request.Date.Date,
                StartTime = currentTime,
                EndTime = slotEndTime,
                Price = activeConfiguration.Price,
                IsActive = true,
                IsBooked = false
            });

            currentTime = slotEndTime.Add(TimeSpan.FromMinutes(activeConfiguration.SlotGapMinutes));
        }

        if (!generatedSlots.Any())
            return Result.Failure($"No slots could be generated for Gaming Station '{gamingStation.Name}' on {request.Date.ToShortDateString()} with the current configuration.");

        try
        {
            await _db.GamingSlots.AddRangeAsync(generatedSlots, cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);
            return Result.Success($"Successfully generated {generatedSlots.Count} slots for Gaming Station '{gamingStation.Name}' on {request.Date.ToShortDateString()}.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to generate slots: {ex.Message}");
        }
    }

    public async Task<Result> GenerateSlotsForDateRangeAsync(GenerateSlotsForDateRangeRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingStationId == Guid.Empty)
            return Result.Failure("Gaming Station ID is required.");

        if (request.StartDate.Date > request.EndDate.Date)
            return Result.Failure("Start Date cannot be after End Date.");

        var gamingStation = await _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .SingleOrDefaultAsync(gs => gs.Id == request.GamingStationId, cancellationToken);

        if (gamingStation == null)
            return Result.Failure($"Gaming Station with ID '{request.GamingStationId}' not found.");

        if (!gamingStation.IsActive)
            return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive. Cannot generate slots.");

        var activeConfiguration = await _db.GamingSlotConfigurations
            .Where(gsc => gsc.GamingStationId == request.GamingStationId && gsc.IsActive)
            .OrderByDescending(gsc => gsc.CreatedAt) // Get the latest active configuration
            .FirstOrDefaultAsync(cancellationToken);

        if (activeConfiguration == null)
            return Result.Failure($"No active slot configuration found for Gaming Station '{gamingStation.Name}'.");

        var totalGeneratedSlots = 0;
        for (var date = request.StartDate.Date; date <= request.EndDate.Date; date = date.AddDays(1))
        {
            // Check for existing slots for the same station and date to ensure idempotency
            if (await _db.GamingSlots.AnyAsync(gs => gs.GamingStationId == request.GamingStationId && gs.Date.Date == date.Date, cancellationToken))
            {
                // Skip generation for this date if slots already exist
                continue;
            }

            var generatedSlotsForDay = new List<GamingSlot>();
            var currentTime = activeConfiguration.StartTime;

            while (currentTime < activeConfiguration.EndTime)
            {
                var slotEndTime = currentTime.Add(TimeSpan.FromMinutes(activeConfiguration.SlotDurationMinutes));

                if (slotEndTime > activeConfiguration.EndTime)
                {
                    break; // Slot exceeds end time
                }

                generatedSlotsForDay.Add(new GamingSlot
                {
                    GamingStationId = request.GamingStationId,
                    GamingSlotConfigurationId = activeConfiguration.Id,
                    Date = date.Date,
                    StartTime = currentTime,
                    EndTime = slotEndTime,
                    Price = activeConfiguration.Price,
                    IsActive = true,
                    IsBooked = false
                });

                currentTime = slotEndTime.Add(TimeSpan.FromMinutes(activeConfiguration.SlotGapMinutes));
            }

            if (generatedSlotsForDay.Any())
            {
                await _db.GamingSlots.AddRangeAsync(generatedSlotsForDay, cancellationToken);
                totalGeneratedSlots += generatedSlotsForDay.Count;
            }
        }

        if (totalGeneratedSlots == 0)
            return Result.Success($"No new slots generated for Gaming Station '{gamingStation.Name}' for the specified date range. All slots might already exist or configuration prevents generation.");

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
            return Result.Success($"Successfully generated {totalGeneratedSlots} slots for Gaming Station '{gamingStation.Name}' for the date range {request.StartDate.ToShortDateString()} to {request.EndDate.ToShortDateString()}.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to generate slots for date range: {ex.Message}");
        }
    }

    public async Task<Result> RegenerateSlotsForGamingStationAsync(RegenerateSlotsForStationRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingStationId == Guid.Empty)
            return Result.Failure("Gaming Station ID is required.");

        var gamingStation = await _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .SingleOrDefaultAsync(gs => gs.Id == request.GamingStationId, cancellationToken);

        if (gamingStation == null)
            return Result.Failure($"Gaming Station with ID '{request.GamingStationId}' not found.");

        if (!gamingStation.IsActive)
            return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive. Cannot regenerate slots.");

        var activeConfiguration = await _db.GamingSlotConfigurations
            .Where(gsc => gsc.GamingStationId == request.GamingStationId && gsc.IsActive)
            .OrderByDescending(gsc => gsc.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeConfiguration == null)
            return Result.Failure($"No active slot configuration found for Gaming Station '{gamingStation.Name}'.");

        var startDate = request.StartDate?.Date ?? DateTime.UtcNow.Date;
        var endDate = request.EndDate?.Date ?? DateTime.UtcNow.Date.AddDays(30); // Default to next 30 days

        // Safely remove or replace only future unbooked slots.
        var existingFutureUnbookedSlots = await _db.GamingSlots
            .Where(gs => gs.GamingStationId == request.GamingStationId &&
                         gs.Date.Date >= startDate &&
                         gs.Date.Date <= endDate &&
                         !gs.IsBooked)
            .ToListAsync(cancellationToken);

        if (existingFutureUnbookedSlots.Any())
        {
            _db.GamingSlots.RemoveRange(existingFutureUnbookedSlots);
            await _db.SaveChangesAsync(cancellationToken);
        }

        var totalGeneratedSlots = 0;
        for (var date = startDate; date <= endDate; date = date.AddDays(1))
        {
            var generatedSlotsForDay = new List<GamingSlot>();
            var currentTime = activeConfiguration.StartTime;

            while (currentTime < activeConfiguration.EndTime)
            {
                var slotEndTime = currentTime.Add(TimeSpan.FromMinutes(activeConfiguration.SlotDurationMinutes));

                if (slotEndTime > activeConfiguration.EndTime)
                {
                    break;
                }

                generatedSlotsForDay.Add(new GamingSlot
                {
                    GamingStationId = request.GamingStationId,
                    GamingSlotConfigurationId = activeConfiguration.Id,
                    Date = date.Date,
                    StartTime = currentTime,
                    EndTime = slotEndTime,
                    Price = activeConfiguration.Price,
                    IsActive = true,
                    IsBooked = false
                });

                currentTime = slotEndTime.Add(TimeSpan.FromMinutes(activeConfiguration.SlotGapMinutes));
            }

            if (generatedSlotsForDay.Any())
            {
                await _db.GamingSlots.AddRangeAsync(generatedSlotsForDay, cancellationToken);
                totalGeneratedSlots += generatedSlotsForDay.Count;
            }
        }

        if (totalGeneratedSlots == 0)
            return Result.Success($"No new slots generated during regeneration for Gaming Station '{gamingStation.Name}' for the specified date range. All slots might already exist or configuration prevents generation.");

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
            return Result.Success($"Successfully regenerated {totalGeneratedSlots} slots for Gaming Station '{gamingStation.Name}' for the date range {startDate.ToShortDateString()} to {endDate.ToShortDateString()}.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to regenerate slots: {ex.Message}");
        }
    }

    public async Task<Result> DisableGeneratedSlotsForDateAsync(DisableGeneratedSlotsForDateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingStationId == Guid.Empty)
            return Result.Failure("Gaming Station ID is required.");

        var slotsToDisable = await _db.GamingSlots
            .Where(gs => gs.GamingStationId == request.GamingStationId && gs.Date.Date == request.Date.Date && !gs.IsBooked && gs.IsActive)
            .ToListAsync(cancellationToken);

        if (!slotsToDisable.Any())
            return Result.Success($"No active, unbooked slots found to disable for Gaming Station '{request.GamingStationId}' on {request.Date.ToShortDateString()}.");

        try
        {
            foreach (var slot in slotsToDisable)
            {
                slot.IsActive = false;
            }
            _db.GamingSlots.UpdateRange(slotsToDisable);
            await _db.SaveChangesAsync(cancellationToken);
            return Result.Success($"Successfully disabled {slotsToDisable.Count} unbooked slots for Gaming Station '{request.GamingStationId}' on {request.Date.ToShortDateString()}.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to disable slots: {ex.Message}");
        }
    }

    public async Task<List<GamingSlotResponse>> GetSlotsByGamingStationAndDateAsync(GetSlotsByStationAndDateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null || request.GamingStationId == Guid.Empty)
            return new List<GamingSlotResponse>();

        var slots = await _db.GamingSlots
            .Where(gs => gs.GamingStationId == request.GamingStationId && gs.Date.Date == request.Date.Date)
            .Include(gs => gs.GamingStation)
            .AsNoTracking()
            .OrderBy(gs => gs.StartTime)
            .ToListAsync(cancellationToken);

        return slots.Select(gs => new GamingSlotResponse
        {
            Id = gs.Id,
            GamingStationId = gs.GamingStationId,
            GamingStationName = gs.GamingStation.Name,
            GamingSlotConfigurationId = gs.GamingSlotConfigurationId,
            Date = gs.Date,
            StartTime = gs.StartTime,
            EndTime = gs.EndTime,
            Price = gs.Price,
            IsBooked = gs.IsBooked,
            BookingId = gs.BookingId,
            IsActive = gs.IsActive,
            CreatedAt = gs.CreatedAt,
            LastModifiedAt = gs.LastModifiedAt
        }).ToList();
    }
}