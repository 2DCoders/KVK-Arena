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

            // Keep the category's own displayed price (shown on the guest site's
            // service-selection card) in sync with the slot configuration's price.
            gamingCategory.Price = request.Price;

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

            // Keep the category's own displayed price (shown on the guest site's
            // service-selection card) in sync with the slot configuration's price.
            var gamingCategory = await _db.GamingCategories
                .FirstOrDefaultAsync(c => c.Id == config.GamingCategoryId, cancellationToken);
            if (gamingCategory != null)
                gamingCategory.Price = request.Price;

            await RegenerateSlotsInternalAsync(config, cancellationToken);

            _db.GamingSlotConfigurations.Update(config);
            await _db.SaveChangesAsync(cancellationToken);

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

            // When config is deleted, we should clear the generated slots associated with it —
            // but slots still referenced by a booking/hold can't be hard-deleted (FK RESTRICT),
            // so deactivate those instead.
            var existingSlots = await _db.GamingSlots
                .Where(x => x.GamingCategoryId == config.GamingCategoryId)
                .ToListAsync(cancellationToken);

            if (existingSlots.Count > 0)
            {
                var existingSlotIds = existingSlots.Select(s => s.Id).ToList();

                var referencedSlotIds = await _db.GamingBookings
                    .Where(b => existingSlotIds.Contains(b.GamingSlotId))
                    .Select(b => b.GamingSlotId)
                    .Union(_db.GamingBookingHolds
                        .Where(h => existingSlotIds.Contains(h.GamingSlotId))
                        .Select(h => h.GamingSlotId))
                    .Distinct()
                    .ToListAsync(cancellationToken);

                var referencedSet = referencedSlotIds.ToHashSet();

                var slotsToDelete = existingSlots.Where(s => !referencedSet.Contains(s.Id)).ToList();
                var slotsToDeactivate = existingSlots.Where(s => referencedSet.Contains(s.Id)).ToList();

                if (slotsToDelete.Count > 0)
                    _db.GamingSlots.RemoveRange(slotsToDelete);

                foreach (var slot in slotsToDeactivate)
                    slot.IsActive = false;

                if (slotsToDeactivate.Count > 0)
                {
                    // Some slots are still referenced — keep the configuration row too,
                    // since deleting it could cascade-conflict with those same slots.
                    await _db.SaveChangesAsync(cancellationToken);
                    return Result.Success(
                        "Unreferenced slots deleted. Some slots are still linked to existing bookings and were deactivated instead; the configuration was kept.");
                }
            }

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
        // Only active slot templates are bookable. Re-saving a slot configuration with a
        // different schedule deactivates (rather than deletes) any old slot still referenced
        // by a historical booking, so without this filter stale time slots from a previous
        // configuration kept showing up alongside the new ones on the guest site.
        var allAvailableSlots = await _db.GamingSlots
            .AsNoTracking()
            .Where(x => x.GamingCategoryId == categoryId && x.GamingStationId == stationId && x.IsActive)
            .OrderBy(x => x.StartTime)
            .ToListAsync(cancellationToken);

        var bookedSlotsIds = await _db.GamingBookings
            .AsNoTracking()
            .Where(b => b.GamingStationId == stationId &&
                        b.BookingDate == date && b.GamingCategoryId == categoryId &&
                        b.Status != GamingBookingStatus.Cancelled)
            .Select(x => x.GamingSlotId)
            .ToListAsync(cancellationToken);

        //and check with CourtBookingHold also
        // ExpiresAt is a "timestamp without time zone" column; DateTime.Now has
        // DateTimeKind.Local, and binding a Local-kind value as a query parameter
        // against it can get silently shifted by the server's UTC offset, making
        // holds look "not yet expired" for hours after they actually expired.
        // Normalize to Unspecified so it's compared as the plain naive value it is.
        var nowUnspecified = DateTime.SpecifyKind(DateTime.Now, DateTimeKind.Unspecified);

        var bookingHoldNotExpired = await _db.GamingBookingHolds
            .AsNoTracking()
            .Where(b => b.GamingStationId == stationId &&
                        b.GamingCategoryId == categoryId &&
                        b.BookingDate == date &&
                        b.Status == GamingBookingHoldStatus.Pending &&
                        b.ExpiresAt > nowUnspecified)
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
        // IMPORTANT: GamingSlot is a reusable (station, time-of-day) template with no
        // date of its own — GamingBooking/GamingBookingHold carry the actual calendar
        // date and just point at a slot template. So "this slot has a booking" does NOT
        // mean "this exact time is busy right now" — it just means that time-of-day has
        // been used on SOME date, ever. Treating that as a reason to deactivate the slot
        // (as an earlier version of this method did) ends up disabling almost every slot
        // the moment any config is re-saved. Instead: slots that still match the new
        // schedule are updated in place (so existing bookings/holds keep pointing at a
        // valid, still-active slot); only genuinely orphaned slots (whose time no longer
        // appears in the new schedule) are deleted, or deactivated if something still
        // references them.

        // 1. Get all active gaming station IDs for the category
        var stationIds = await _db.GamingStations
            .Where(gs => gs.GamingCategoryId == config.GamingCategoryId && gs.IsActive)
            .Select(gs => gs.Id)
            .ToListAsync(cancellationToken);

        if (stationIds.Count == 0) return;

        var timeSlots = GenerateSlotTimeIntervals(
            config.StartTime,
            config.EndTime,
            config.SlotDurationMinutes,
            config.SlotGapMinutes);

        var stationIdSet = stationIds.ToHashSet();
        var desiredTimesByStation = stationIds.ToDictionary(
            id => id,
            _ => timeSlots.ToDictionary(t => t.StartTime, t => t.EndTime));

        var existingSlots = await _db.GamingSlots
            .Where(x => x.GamingCategoryId == config.GamingCategoryId)
            .ToListAsync(cancellationToken);

        var existingKeys = new HashSet<(Guid StationId, TimeOnly StartTime)>();
        var orphanedSlots = new List<GamingSlot>();

        foreach (var slot in existingSlots)
        {
            existingKeys.Add((slot.GamingStationId, slot.StartTime));

            var stillWanted = stationIdSet.Contains(slot.GamingStationId) &&
                               desiredTimesByStation[slot.GamingStationId].TryGetValue(slot.StartTime, out var newEndTime);

            if (stillWanted)
            {
                // Update in place — keeps existing bookings/holds pointing at a valid,
                // active slot instead of deactivating it out from under them.
                desiredTimesByStation[slot.GamingStationId].TryGetValue(slot.StartTime, out newEndTime);
                slot.EndTime = newEndTime;
                slot.Price = config.Price;
                slot.GamingSlotConfigurationId = config.Id;
                slot.IsActive = true;
            }
            else
            {
                orphanedSlots.Add(slot);
            }
        }

        if (orphanedSlots.Count > 0)
        {
            var orphanedIds = orphanedSlots.Select(s => s.Id).ToList();

            var referencedOrphanIds = await _db.GamingBookings
                .Where(b => orphanedIds.Contains(b.GamingSlotId))
                .Select(b => b.GamingSlotId)
                .Union(_db.GamingBookingHolds
                    .Where(h => orphanedIds.Contains(h.GamingSlotId))
                    .Select(h => h.GamingSlotId))
                .Distinct()
                .ToListAsync(cancellationToken);

            var referencedSet = referencedOrphanIds.ToHashSet();

            var toDelete = orphanedSlots.Where(s => !referencedSet.Contains(s.Id)).ToList();
            var toDeactivate = orphanedSlots.Where(s => referencedSet.Contains(s.Id)).ToList();

            if (toDelete.Count > 0)
                _db.GamingSlots.RemoveRange(toDelete);

            foreach (var slot in toDeactivate)
                slot.IsActive = false; // kept only because a historical booking/hold references it
        }

        await _db.SaveChangesAsync(cancellationToken);

        // Insert brand-new slots for (station, startTime) combinations that don't
        // already exist (new stations, or new time intervals from a changed schedule).
        var newSlots = new List<GamingSlot>();

        foreach (var stationId in stationIds)
        {
            foreach (var (startTime, endTime) in timeSlots)
            {
                if (existingKeys.Contains((stationId, startTime)))
                    continue;

                newSlots.Add(new GamingSlot
                {
                    GamingCategoryId = config.GamingCategoryId,
                    GamingSlotConfigurationId = config.Id,
                    GamingStationId = stationId,
                    StartTime = startTime,
                    EndTime = endTime,
                    IsActive = true,
                    Price = config.Price
                });
            }
        }

        if (newSlots.Count == 0) return;

        // Optimize bulk insert by turning off change tracking temporarily
        _db.ChangeTracker.AutoDetectChangesEnabled = false;
        try
        {
            _db.GamingSlots.AddRange(newSlots);
            await _db.SaveChangesAsync(cancellationToken);
        }
        finally
        {
            _db.ChangeTracker.AutoDetectChangesEnabled = true;
        }
    }

    private static List<(TimeOnly StartTime, TimeOnly EndTime)> GenerateSlotTimeIntervals(
        TimeOnly startTime,
        TimeOnly endTime,
        int durationMinutes,
        int gapMinutes)
    {
        var slots = new List<(TimeOnly StartTime, TimeOnly EndTime)>();
        if (durationMinutes <= 0) return slots;

        var baseDate = DateTime.Today;
        var startDateTime = baseDate.Add(startTime.ToTimeSpan());
        var endDateTime = baseDate.Add(endTime.ToTimeSpan());

        if (endDateTime <= startDateTime)
        {
            endDateTime = endDateTime.AddDays(1);
        }

        var current = startDateTime;

        while (current.AddMinutes(durationMinutes) <= endDateTime)
        {
            var slotEnd = current.AddMinutes(durationMinutes);
            slots.Add((TimeOnly.FromDateTime(current), TimeOnly.FromDateTime(slotEnd)));

            current = slotEnd.AddMinutes(gapMinutes);
        }

        return slots;
    }
}