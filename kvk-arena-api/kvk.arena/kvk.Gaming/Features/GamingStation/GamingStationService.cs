using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming;
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

    public async Task<Result> CreateAsync(GamingStationCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingCategoryId == Guid.Empty)
            return Result.Failure("Gaming Category ID is required.");

        if (string.IsNullOrWhiteSpace(request.StationCode))
            return Result.Failure("Station Code is required.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        var gamingCategory = await _db.GamingCategories.FindAsync(new object[] { request.GamingCategoryId }, cancellationToken);
        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");

        if (!gamingCategory.IsActive)
            return Result.Failure($"Gaming category '{gamingCategory.Name}' is inactive. Cannot create gaming station.");

        // Station Code must be unique across the system.
        if (await _db.GamingStations.AnyAsync(gs => gs.StationCode == request.StationCode, cancellationToken))
            return Result.Failure($"Gaming station with code '{request.StationCode}' already exists.");

        // Station Name must be unique within the same Gaming Category.
        if (await _db.GamingStations.AnyAsync(gs => gs.GamingCategoryId == request.GamingCategoryId && gs.Name == request.Name, cancellationToken))
            return Result.Failure($"Gaming station with name '{request.Name}' already exists in category '{gamingCategory.Name}'.");

        // Handle GameId based on GamingCategory.HasGames
        if (gamingCategory.HasGames)
        {
            if (request.GameId == null || request.GameId == Guid.Empty)
                return Result.Failure($"Gaming category '{gamingCategory.Name}' requires a Game to be selected.");

            var game = await _db.Games.FindAsync(new object[] { request.GameId.Value }, cancellationToken);
            if (game == null)
                return Result.Failure($"Game with ID '{request.GameId}' not found.");
            
            if (!game.IsActive)
                return Result.Failure($"Game '{game.Name}' is inactive. Cannot create gaming station with an inactive game.");
        }
        else // Category does not have games (e.g., Pool)
        {
            if (request.GameId != null && request.GameId != Guid.Empty)
                return Result.Failure($"Gaming category '{gamingCategory.Name}' does not support game selection.");
        }

        try
        {
            var gamingStation = new Domain.GamingStation
            {
                GamingCategoryId = request.GamingCategoryId,
                GameId = request.GameId ?? Guid.Empty, // Set to Guid.Empty if no game is selected
                StationCode = request.StationCode,
                Name = request.Name,
                IsActive = request.IsActive
            };

            _db.GamingStations.Add(gamingStation);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GamingStationResponse
            {
                Id = gamingStation.Id,
                GamingCategoryId = gamingStation.GamingCategoryId,
                GamingCategoryName = gamingCategory.Name,
                GameId = gamingStation.GameId != Guid.Empty ? gamingStation.GameId : null,
                GameName = gamingStation.GameId != Guid.Empty ? _db.Games.Find(gamingStation.GameId)?.Name : null,
                StationCode = gamingStation.StationCode,
                Name = gamingStation.Name,
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

    public async Task<Result> UpdateAsync(GamingStationUpdateRequest request, CancellationToken cancellationToken = default)
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

        var gamingCategory = await _db.GamingCategories.FindAsync(new object[] { request.GamingCategoryId }, cancellationToken);
        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");

        if (!gamingCategory.IsActive)
            return Result.Failure($"Gaming category '{gamingCategory.Name}' is inactive. Cannot update gaming station.");

        // Station Code must be unique across the system.
        if (await _db.GamingStations.AnyAsync(gs => gs.Id != request.Id && gs.StationCode == request.StationCode, cancellationToken))
            return Result.Failure($"Gaming station with code '{request.StationCode}' already exists.");

        // Station Name must be unique within the same Gaming Category.
        if (await _db.GamingStations.AnyAsync(gs => gs.Id != request.Id && gs.GamingCategoryId == request.GamingCategoryId && gs.Name == request.Name, cancellationToken))
            return Result.Failure($"Gaming station with name '{request.Name}' already exists in category '{gamingCategory.Name}'.");

        // Category changes should not be allowed when the station has existing game mappings.
        if (existingStation.GamingCategoryId != request.GamingCategoryId && existingStation.GameId != Guid.Empty)
        {
            return Result.Failure("Category change is not allowed for stations with existing game mappings.");
        }

        // Handle GameId based on GamingCategory.HasGames
        if (gamingCategory.HasGames)
        {
            if (request.GameId == null || request.GameId == Guid.Empty)
                return Result.Failure($"Gaming category '{gamingCategory.Name}' requires a Game to be selected.");

            var game = await _db.Games.FindAsync(new object[] { request.GameId.Value }, cancellationToken);
            if (game == null)
                return Result.Failure($"Game with ID '{request.GameId}' not found.");

            if (!game.IsActive)
                return Result.Failure($"Game '{game.Name}' is inactive. Cannot update gaming station with an inactive game.");
        }
        else // Category does not have games (e.g., Pool)
        {
            if (request.GameId != null && request.GameId != Guid.Empty)
                return Result.Failure($"Gaming category '{gamingCategory.Name}' does not support game selection.");
        }

        try
        {
            existingStation.GamingCategoryId = request.GamingCategoryId;
            existingStation.GameId = request.GameId ?? Guid.Empty;
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
                GameId = existingStation.GameId != Guid.Empty ? existingStation.GameId : null,
                GameName = existingStation.GameId != Guid.Empty ? _db.Games.Find(existingStation.GameId)?.Name : null,
                StationCode = existingStation.StationCode,
                Name = existingStation.Name,
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
            .Include(gs => gs.Game)
            .AsNoTracking()
            .SingleOrDefaultAsync(gs => gs.Id == id, cancellationToken);

        if (gamingStation == null)
            return null;

        return new GamingStationResponse
        {
            Id = gamingStation.Id,
            GamingCategoryId = gamingStation.GamingCategoryId,
            GamingCategoryName = gamingStation.GamingCategory.Name,
            GameId = gamingStation.GameId != Guid.Empty ? gamingStation.GameId : null,
            GameName = gamingStation.GameId != Guid.Empty ? gamingStation.Game?.Name : null,
            StationCode = gamingStation.StationCode,
            Name = gamingStation.Name,
            IsActive = gamingStation.IsActive,
            CreatedAt = gamingStation.CreatedAt,
            LastModifiedAt = gamingStation.LastModifiedAt
        };
    }

    public async Task<List<GamingStationResponse>> GetListAsync(GamingStationListRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .Include(gs => gs.Game)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(gs => gs.Name.Contains(request.SearchTerm) || gs.StationCode.Contains(request.SearchTerm));
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
            GameId = gs.GameId != Guid.Empty ? gs.GameId : null,
            GameName = gs.GameId != Guid.Empty ? gs.Game?.Name : null,
            StationCode = gs.StationCode,
            Name = gs.Name,
            IsActive = gs.IsActive,
            CreatedAt = gs.CreatedAt,
            LastModifiedAt = gs.LastModifiedAt
        }).ToList();
    }

    public async Task<List<GamingStationResponse>> GetStationsByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        if (categoryId == Guid.Empty)
            return new List<GamingStationResponse>();

        var gamingStations = await _db.GamingStations
            .Include(gs => gs.GamingCategory)
            .Include(gs => gs.Game)
            .AsNoTracking()
            .Where(gs => gs.GamingCategoryId == categoryId && gs.IsActive) // Only active stations in active listings
            .OrderBy(gs => gs.Name)
            .ToListAsync(cancellationToken);

        return gamingStations.Select(gs => new GamingStationResponse
        {
            Id = gs.Id,
            GamingCategoryId = gs.GamingCategoryId,
            GamingCategoryName = gs.GamingCategory.Name,
            GameId = gs.GameId != Guid.Empty ? gs.GameId : null,
            GameName = gs.GameId != Guid.Empty ? gs.Game?.Name : null,
            StationCode = gs.StationCode,
            Name = gs.Name,
            IsActive = gs.IsActive,
            CreatedAt = gs.CreatedAt,
            LastModifiedAt = gs.LastModifiedAt
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
        // var hasActiveBookings = await _db.Bookings.AnyAsync(b => b.GamingStationId == id && b.Status == BookingStatus.Active && b.EndTime > DateTime.UtcNow, cancellationToken);
        // if (hasActiveBookings)
        //     return Result.Failure("Cannot delete gaming station as it has active future bookings.");

        // Prevent deletion of a Gaming Station if active slot configurations exist.
        // TODO: Implement actual checks for active slot configurations.
        // var hasActiveSlotConfigurations = await _db.SlotConfigurations.AnyAsync(sc => sc.GamingStationId == id && sc.IsActive, cancellationToken);
        // if (hasActiveSlotConfigurations)
        //     return Result.Failure("Cannot delete gaming station as it has active slot configurations.");

        try
        {
            gamingStation.IsActive = false; // Soft delete by setting IsActive to false
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
}