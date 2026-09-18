using kvk.Badminton.Enums;
using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming;
using kvk.Gaming.Enums;
using kvk.Gaming.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Features.GamingStation;

public class GamingStationService : IGamingStationService
{
    private readonly GamingDbContext _db;

    public GamingStationService(GamingDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(GamingStationCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingCategoryId == Guid.Empty)
            return Result.Failure("Gaming Category ID is required.");

        if (string.IsNullOrWhiteSpace(request.StationCode))
            return Result.Failure("Station Code is required.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        var gamingCategory =
            await _db.GamingCategories.FindAsync(new object[] { request.GamingCategoryId }, cancellationToken);
        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");

        if (!gamingCategory.IsActive)
            return Result.Failure(
                $"Gaming category '{gamingCategory.Name}' is inactive. Cannot create gaming station.");

        // Station Code must be unique across the system.
        if (await _db.GamingStations.AnyAsync(gs => gs.StationCode == request.StationCode, cancellationToken))
            return Result.Failure($"Gaming station with code '{request.StationCode}' already exists.");

        // Station Name must be unique within the same Gaming Category.
        if (await _db.GamingStations.AnyAsync(
                gs => gs.GamingCategoryId == request.GamingCategoryId && gs.Name == request.Name, cancellationToken))
            return Result.Failure(
                $"Gaming station with name '{request.Name}' already exists in category '{gamingCategory.Name}'.");

        try
        {
            var gamingStation = new Domain.GamingStation
            {
                GamingCategoryId = request.GamingCategoryId,
                StationCode = request.StationCode,
                Name = request.Name,
                IsActive = request.IsActive,
            };

            _db.GamingStations.Add(gamingStation);
            await _db.SaveChangesAsync(cancellationToken);


            //after creating category eventually needs to check is there any available GamingSlotConfiguration for this category
            //if yes need to create GamingSlots for this station based on the existing GamingSlotConfiguration
            var existingSlotConfigurations = await _db.GamingSlotConfigurations
                .Where(sc => sc.GamingCategoryId == request.GamingCategoryId && sc.IsActive == 1)
                .Select(sc => new GamingSlotConfigurationRequest
                {
                    GamingConfigurationId = sc.Id,
                    GamingCategoryId = sc.GamingCategoryId,
                    StartTime = sc.StartTime,
                    EndTime = sc.EndTime,
                    SlotDurationMinutes = sc.SlotDurationMinutes,
                    SlotGapMinutes = sc.SlotGapMinutes,
                    Price = sc.Price,
                    IsActive = sc.IsActive
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (existingSlotConfigurations != null)
            {
                await RegenerateSlotsInternalAsync(existingSlotConfigurations, EntityState.Added, gamingStation.Id,
                    cancellationToken);
            }


            var response = new GamingStationResponse
            {
                Id = gamingStation.Id,
                GamingCategoryId = gamingStation.GamingCategoryId,
                GamingCategoryName = gamingCategory.Name,
                StationCode = gamingStation.StationCode,
                Name = gamingStation.Name,
                Price = gamingCategory.Price,
                IsActive = gamingStation.IsActive,
                CreatedAt = gamingStation.CreatedAt,
                LastModifiedAt = gamingStation.LastModifiedAt
            };


            return Result.Success("Gaming station created successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create gaming station: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(GamingStationUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.Id == Guid.Empty)
            return Result.Failure("Id is required.");

        if (request.GamingCategoryId == Guid.Empty)
            return Result.Failure("Gaming Category ID is required.");

        if (string.IsNullOrWhiteSpace(request.StationCode))
            return Result.Failure("Station Code is required.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        var existingStation = await _db.GamingStations.FindAsync(new object[] { request.Id }, cancellationToken);
        if (existingStation == null)
            return Result.Failure($"Gaming station with ID '{request.Id}' not found.");

        var gamingCategory =
            await _db.GamingCategories.FindAsync(new object[] { request.GamingCategoryId }, cancellationToken);
        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");

        if (!gamingCategory.IsActive)
            return Result.Failure(
                $"Gaming category '{gamingCategory.Name}' is inactive. Cannot update gaming station.");

        // Station Code must be unique across the system.
        if (await _db.GamingStations.AnyAsync(gs => gs.Id != request.Id && gs.StationCode == request.StationCode,
                cancellationToken))
            return Result.Failure($"Gaming station with code '{request.StationCode}' already exists.");

        // Station Name must be unique within the same Gaming Category.
        if (await _db.GamingStations.AnyAsync(
                gs => gs.Id != request.Id && gs.GamingCategoryId == request.GamingCategoryId && gs.Name == request.Name,
                cancellationToken))
            return Result.Failure(
                $"Gaming station with name '{request.Name}' already exists in category '{gamingCategory.Name}'.");

        // Category changes should not be allowed when the station has existing game mappings.
        if (existingStation.GamingCategoryId != request.GamingCategoryId)
        {
            return Result.Failure("Category change is not allowed for stations with existing game mappings.");
        }

        try
        {
            existingStation.GamingCategoryId = request.GamingCategoryId;
            existingStation.StationCode = request.StationCode;
            existingStation.Name = request.Name;
            existingStation.IsActive = request.IsActive;

            _db.GamingStations.Update(existingStation);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GamingStationResponse
            {
                Id = existingStation.Id,
                GamingCategoryId = existingStation.GamingCategoryId,
                GamingCategoryName = gamingCategory.Name,
                StationCode = existingStation.StationCode,
                Name = existingStation.Name,
                Price = gamingCategory.Price,
                IsActive = existingStation.IsActive,
                CreatedAt = existingStation.CreatedAt,
                LastModifiedAt = existingStation.LastModifiedAt
            };

            return Result.Success("Gaming station updated successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update gaming station: {ex.Message}");
        }
    }

    public async Task<GamingStationResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var gamingStation = await _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .AsNoTracking()
            .SingleOrDefaultAsync(gs => gs.Id == id, cancellationToken);

        if (gamingStation == null)
            return null;

        return new GamingStationResponse
        {
            Id = gamingStation.Id,
            GamingCategoryId = gamingStation.GamingCategoryId,
            GamingCategoryName = gamingStation.GamingCategory.Name,
            StationCode = gamingStation.StationCode,
            Name = gamingStation.Name,
            IsActive = gamingStation.IsActive,
            CreatedAt = gamingStation.CreatedAt,
            LastModifiedAt = gamingStation.LastModifiedAt,
            Price = gamingStation.GamingCategory.Price
        };
    }

    public async Task<List<GamingStationResponse>> GetListAsync(GamingStationListRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(gs =>
                gs.Name.Contains(request.SearchTerm) || gs.StationCode.Contains(request.SearchTerm));
        }

        if (request.GamingCategoryId.HasValue && request.GamingCategoryId != Guid.Empty)
        {
            query = query.Where(gs => gs.GamingCategoryId == request.GamingCategoryId.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(gs => gs.IsActive == request.IsActive.Value);
        }
        else
        {
            // Soft deleted gaming stations should not appear in active listings.
            query = query.Where(gs => gs.IsActive);
        }

        var gamingStations = await query
            .OrderBy(gs => gs.Name)
            .ToListAsync(cancellationToken);

        return gamingStations.Select(gs => new GamingStationResponse
        {
            Id = gs.Id,
            GamingCategoryId = gs.GamingCategoryId,
            GamingCategoryName = gs.GamingCategory.Name,
            StationCode = gs.StationCode,
            Name = gs.Name,
            IsActive = gs.IsActive,
            CreatedAt = gs.CreatedAt,
            LastModifiedAt = gs.LastModifiedAt,
            Price = gs.GamingCategory.Price
        }).ToList();
    }

    public async Task<List<GamingStationResponse>> GetStationsByCategoryAsync(Guid categoryId,
        CancellationToken cancellationToken = default)
    {
        if (categoryId == Guid.Empty)
            return new List<GamingStationResponse>();

        var gamingStations = await _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .AsNoTracking()
            .Where(gs => gs.GamingCategoryId == categoryId) // Only active stations in active listings
            .OrderBy(gs => gs.Name)
            .ToListAsync(cancellationToken);

        return gamingStations.Select(gs => new GamingStationResponse
        {
            Id = gs.Id,
            GamingCategoryId = gs.GamingCategoryId,
            GamingCategoryName = gs.GamingCategory.Name,
            StationCode = gs.StationCode,
            Name = gs.Name,
            IsActive = gs.IsActive,
            CreatedAt = gs.CreatedAt,
            LastModifiedAt = gs.LastModifiedAt,
            Price = gs.GamingCategory.Price
        }).ToList();
    }

    public async Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var gamingStation = await _db.GamingStations.FindAsync(new object[] { id }, cancellationToken);
        if (gamingStation == null)
            return Result.Failure($"Gaming station with ID '{id}' not found.");

        // Prevent deletion of a Gaming Station if active future bookings exist.
        // TODO: Implement actual checks for active future bookings.
        var hasActiveBookings =
            await _db.GamingBookings.AnyAsync(b => b.GamingStationId == id && b.Status == GamingBookingStatus.Confirmed,
                cancellationToken);
        if (hasActiveBookings)
            return Result.Failure("Cannot delete gaming station as it has active future bookings.");

        // Prevent deletion of a Gaming Station if active slot configurations exist.
        // TODO: Implement actual checks for active slot configurations.
        // var hasActiveSlotConfigurations = await _db.SlotConfigurations.AnyAsync(sc => sc.GamingStationId == id && sc.IsActive, cancellationToken);
        // if (hasActiveSlotConfigurations)
        //     return Result.Failure("Cannot delete gaming station as it has active slot configurations.");

        try
        {
            gamingStation.IsDeleted = false; // Soft delete by setting IsActive to false
            _db.GamingStations.Update(gamingStation);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Gaming station soft deleted successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to soft delete gaming station: {ex.Message}");
        }
    }

    public async Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var gamingStation = await _db.GamingStations.FindAsync(new object[] { id }, cancellationToken);
        if (gamingStation == null)
            return Result.Failure($"Gaming station with ID '{id}' not found.");

        if (gamingStation.IsActive)
            return Result.Failure("Gaming station is already active.");

        try
        {
            gamingStation.IsActive = true;
            _db.GamingStations.Update(gamingStation);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Gaming station activated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to activate gaming station: {ex.Message}");
        }
    }

    public async Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var gamingStation = await _db.GamingStations.FindAsync(new object[] { id }, cancellationToken);
        if (gamingStation == null)
            return Result.Failure($"Gaming station with ID '{id}' not found.");

        if (!gamingStation.IsActive)
            return Result.Failure("Gaming station is already inactive.");

        try
        {
            gamingStation.IsActive = false;
            _db.GamingStations.Update(gamingStation);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Gaming station deactivated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to deactivate gaming station: {ex.Message}");
        }
    }


    private async Task RegenerateSlotsInternalAsync(GamingSlotConfigurationRequest config
        , EntityState entityState
        , Guid? stationId
        , CancellationToken cancellationToken)
    {
        List<Guid> targetStationIds;

        if (entityState == EntityState.Added && stationId.HasValue)
        {
            targetStationIds = new List<Guid> { stationId.Value };
        }
        else if (entityState == EntityState.Modified && !stationId.HasValue)
        {
            await _db.GamingSlots
                .Where(x => x.GamingCategoryId == config.GamingCategoryId)
                .ExecuteDeleteAsync(cancellationToken);

            targetStationIds = await _db.GamingStations
                .Where(gs => gs.GamingCategoryId == config.GamingCategoryId && gs.IsActive)
                .Select(gs => gs.Id)
                .ToListAsync(cancellationToken);
        }
        else
        {
            return;
        }

        if (targetStationIds.Count == 0)
            return;

        var timeSlots = GenerateSlotTimeIntervals(
            config.StartTime,
            config.EndTime,
            config.SlotDurationMinutes,
            config.SlotGapMinutes);

        if (timeSlots.Count == 0)
            return;

        var newSlots = new List<GamingSlot>(targetStationIds.Count * timeSlots.Count);

        foreach (var stId in targetStationIds)
        {
            foreach (var (startTime, endTime) in timeSlots)
            {
                newSlots.Add(new GamingSlot
                {
                    GamingCategoryId = config.GamingCategoryId,
                    GamingSlotConfigurationId = config.GamingConfigurationId,
                    GamingStationId = stId,
                    StartTime = startTime,
                    EndTime = endTime,
                    Price = config.Price,
                    IsActive = true
                });
            }
        }

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


    public class GamingSlotConfigurationRequest
    {
        public Guid GamingConfigurationId { get; set; }

        public Guid GamingCategoryId { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public int SlotDurationMinutes { get; set; }

        public int SlotGapMinutes { get; set; }

        public decimal Price { get; set; }

        public decimal? IsActive { get; set; }
    }

    public class GamingSlotRequest
    {
        public Guid GamingStationId { get; set; }

        public Guid GamingSlotConfigurationId { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public decimal Price { get; set; }

        public bool IsBooked { get; set; } = false;
        
        public bool IsActive { get; set; } = true; // Can be disabled without deleting

        public Guid GamingCategoryId { get; set; }
    }
}