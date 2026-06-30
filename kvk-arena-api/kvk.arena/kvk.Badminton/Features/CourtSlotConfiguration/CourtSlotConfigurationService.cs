using kvk.Badminton.Domain;
using kvk.Badminton.Enums;
using kvk.Badminton.Interfaces;
using kvk.BuildingBlocks.Common;
using Microsoft.EntityFrameworkCore;

namespace kvk.Badminton.Features.CourtSlotConfiguration;

public class CourtSlotConfigurationService : ICourtSlotConfigurationService
{
    private readonly BadmintonDbContext _db;

    public CourtSlotConfigurationService(BadmintonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<CourtSlotConfigurationResponse> GetByCourtIdAsync(Guid courtId, CancellationToken cancellationToken = default)
    {
        var config = await _db.CourtSlotConfigurations
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.CourtId == courtId, cancellationToken);

        if (config == null)
            return null;

        return MapToResponse(config);
    }

    public async Task<IEnumerable<CourtSlotResponse>> GetByCourtIdAndDateAsync(Guid courtId, DateOnly date, CancellationToken cancellationToken = default)
    {
        var now =  DateTime.Now;
        
        var allAvailableSlots = await _db.CourtSlots
            .AsNoTracking()
            .Where(x => x.CourtId == courtId)
            .OrderBy(x => x.StartTime)
            .ToListAsync(cancellationToken);

        var bookedSlotsIds = await _db.CourtBookings
            .AsNoTracking()
            .Where(b => b.CourtId == courtId &&
                        b.BookingDate == date)
            .Select(x => x.CourtSlotId)
            .ToListAsync(cancellationToken);
        
        //and check with CourtBookingHold also
        var bookingHoldNotExpired = await _db.BookingHolds
            .AsNoTracking()
            .Where(b => b.CourtId == courtId &&
                        b.BookingDate == date &&
                        b.Status == BookingHoldStatus.Pending &&
                        b.ExpiresAt > now)
            .Select(x => x.CourtSlotId)
            .ToListAsync(cancellationToken);

        return allAvailableSlots.Select(slot => new CourtSlotResponse
        {
            Id = slot.Id,
            CourtId = slot.CourtId,
            StartTime = slot.StartTime,
            EndTime = slot.EndTime,
            IsActive = slot.IsActive,
            Price = slot.Price,
            IsBooked = bookedSlotsIds.Contains(slot.Id) || bookingHoldNotExpired.Contains(slot.Id),
            CreatedAt = slot.CreatedAt,
            LastModifiedAt = slot.LastModifiedAt
        });
    }

    public async Task<Result> CreateAsync(CourtSlotConfigurationCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null) return Result.Failure("Request is null");
        if (request.SlotDurationMinutes <= 0) return Result.Failure("Duration must be positive");

        try
        {
            var config = new Domain.CourtSlotConfiguration
            {
                CourtId = request.CourtId,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                SlotDurationMinutes = request.SlotDurationMinutes,
                SlotGapMinutes = request.SlotGapMinutes,
                IsActive = request.IsActive
            };

            _db.CourtSlotConfigurations.Add(config);
            await _db.SaveChangesAsync(cancellationToken);

            await RegenerateSlotsInternalAsync(config, cancellationToken);

            return Result.Success("Configuration created and slots generated");

        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create configuration: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(CourtSlotConfigurationUpdateRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var config = await _db.CourtSlotConfigurations
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (config == null) return Result.Failure("Configuration not found");

            config.StartTime = request.StartTime;
            config.EndTime = request.EndTime;
            config.SlotDurationMinutes = request.SlotDurationMinutes;
            config.SlotGapMinutes = request.SlotGapMinutes;
            config.IsActive = request.IsActive;

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
            var config = await _db.CourtSlotConfigurations
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (config == null) return Result.Failure("Configuration not found");

            // When config is deleted, we should probably clear the generated slots too
            var existingSlots = _db.Set<CourtSlot>().Where(x => x.CourtId == config.CourtId);
            _db.Set<CourtSlot>().RemoveRange(existingSlots);
            
            _db.CourtSlotConfigurations.Remove(config);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Configuration and associated slots deleted");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete configuration: {ex.Message}");
        }
    }

    private async Task RegenerateSlotsInternalAsync(Domain.CourtSlotConfiguration config, CancellationToken cancellationToken)
    {
        // 1. Delete old slots
        var oldSlots = await _db.Set<CourtSlot>()
            .Where(x => x.CourtId == config.CourtId)
            .ToListAsync(cancellationToken);
        
        _db.Set<CourtSlot>().RemoveRange(oldSlots);

        // 2. Generate new slots
        var newSlots = new List<CourtSlot>();
        var currentTime = config.StartTime;
        
        // Simple safety check to prevent infinite loops if end time is before start time or duration is 0
        while (currentTime.AddMinutes(config.SlotDurationMinutes) <= config.EndTime)
        {
            var slotEndTime = currentTime.AddMinutes(config.SlotDurationMinutes);
            
            newSlots.Add(new CourtSlot
            {
                CourtId = config.CourtId,
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
            _db.Set<CourtSlot>().AddRange(newSlots);
            await _db.SaveChangesAsync(cancellationToken);
        }
    }

    private static CourtSlotConfigurationResponse MapToResponse(Domain.CourtSlotConfiguration entity)
    {
        return new CourtSlotConfigurationResponse
        {
            Id = entity.Id,
            CourtId = entity.CourtId,
            StartTime = entity.StartTime,
            EndTime = entity.EndTime,
            SlotDurationMinutes = entity.SlotDurationMinutes,
            SlotGapMinutes = entity.SlotGapMinutes,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            LastModifiedAt = entity.LastModifiedAt
        };
    }

}