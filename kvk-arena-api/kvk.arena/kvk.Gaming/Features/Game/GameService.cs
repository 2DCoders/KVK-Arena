using kvk.BuildingBlocks.Common;
using kvk.Gaming.Domain;
using kvk.Gaming;
using kvk.Gaming.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Features.Game;

public class GameService : IGameService
{
    private readonly GamingDbContext _db;

    public GameService(GamingDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(GameCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.GamingCategoryId == Guid.Empty)
            return Result.Failure("Gaming Category ID is required.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        var gamingCategory = await _db.GamingCategories.FindAsync(new object[] { request.GamingCategoryId }, cancellationToken);
        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");

        if (!gamingCategory.HasGames)
            return Result.Failure($"Games cannot be created for category '{gamingCategory.Name}' because 'HasGames' is false.");
        
        if (!gamingCategory.IsActive)
            return Result.Failure($"Games cannot be created for category '{gamingCategory.Name}' because it is inactive.");

        if (await _db.Games.AnyAsync(g => g.GamingCategoryId == request.GamingCategoryId && g.Name == request.Name, cancellationToken))
            return Result.Failure($"Game with name '{request.Name}' already exists in category '{gamingCategory.Name}'.");

        try
        {
            var game = new Domain.Game
            {
                GamingCategoryId = request.GamingCategoryId,
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive
            };

            _db.Games.Add(game);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GameResponse
            {
                Id = game.Id,
                GamingCategoryId = game.GamingCategoryId,
                GamingCategoryName = gamingCategory.Name,
                Name = game.Name,
                Description = game.Description,
                IsActive = game.IsActive,
                CreatedAt = game.CreatedAt,
                LastModifiedAt = game.LastModifiedAt
            };

            return Result.Success("Game created successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create game: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(GameUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null.");

        if (request.Id == Guid.Empty)
            return Result.Failure("Id is required.");

        if (request.GamingCategoryId == Guid.Empty)
            return Result.Failure("Gaming Category ID is required.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");

        var existingGame = await _db.Games.FindAsync(new object[] { request.Id }, cancellationToken);
        if (existingGame == null)
            return Result.Failure($"Game with ID '{request.Id}' not found.");

        var gamingCategory = await _db.GamingCategories.FindAsync(new object[] { request.GamingCategoryId }, cancellationToken);
        if (gamingCategory == null)
            return Result.Failure($"Gaming category with ID '{request.GamingCategoryId}' not found.");

        if (!gamingCategory.HasGames)
            return Result.Failure($"Games cannot be updated for category '{gamingCategory.Name}' because 'HasGames' is false.");
        
        if (!gamingCategory.IsActive)
            return Result.Failure($"Games cannot be updated for category '{gamingCategory.Name}' because it is inactive.");

        if (await _db.Games.AnyAsync(g => g.Id != request.Id && g.GamingCategoryId == request.GamingCategoryId && g.Name == request.Name, cancellationToken))
            return Result.Failure($"Game with name '{request.Name}' already exists in category '{gamingCategory.Name}'.");

        try
        {
            existingGame.GamingCategoryId = request.GamingCategoryId;
            existingGame.Name = request.Name;
            existingGame.Description = request.Description;
            existingGame.IsActive = request.IsActive;

            _db.Games.Update(existingGame);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GameResponse
            {
                Id = existingGame.Id,
                GamingCategoryId = existingGame.GamingCategoryId,
                GamingCategoryName = gamingCategory.Name,
                Name = existingGame.Name,
                Description = existingGame.Description,
                IsActive = existingGame.IsActive,
                CreatedAt = existingGame.CreatedAt,
                LastModifiedAt = existingGame.LastModifiedAt
            };

            return Result.Success("Game updated successfully.")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update game: {ex.Message}");
        }
    }

    public async Task<GameResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        var game = await _db.Games
            .Include(g => g.GamingCategory)
            .AsNoTracking()
            .SingleOrDefaultAsync(g => g.Id == id, cancellationToken);

        if (game == null)
            return null;

        return new GameResponse
        {
            Id = game.Id,
            GamingCategoryId = game.GamingCategoryId,
            GamingCategoryName = game.GamingCategory.Name,
            Name = game.Name,
            Description = game.Description,
            IsActive = game.IsActive,
            CreatedAt = game.CreatedAt,
            LastModifiedAt = game.LastModifiedAt
        };
    }

    public async Task<List<GameResponse>> GetListAsync(GameListRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Games
            .Include(g => g.GamingCategory)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(g => g.Name.Contains(request.SearchTerm) || g.Description!.Contains(request.SearchTerm));
        }

        if (request.GamingCategoryId.HasValue && request.GamingCategoryId != Guid.Empty)
        {
            query = query.Where(g => g.GamingCategoryId == request.GamingCategoryId.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(g => g.IsActive == request.IsActive.Value);
        }
        else
        {
            // Soft deleted games should not appear in active listings.
            query = query.Where(g => g.IsActive);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var games = await query
            .OrderBy(g => g.Name)
            .ToListAsync(cancellationToken);

        var responses = games.Select(game => new GameResponse
        {
            Id = game.Id,
            GamingCategoryId = game.GamingCategoryId,
            GamingCategoryName = game.GamingCategory.Name,
            Name = game.Name,
            Description = game.Description,
            IsActive = game.IsActive,
            CreatedAt = game.CreatedAt,
            LastModifiedAt = game.LastModifiedAt
        }).ToList();

        return responses;
    }

    public async Task<List<GameResponse>> GetGamesByCategoryAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        if (categoryId == Guid.Empty)
            return new List<GameResponse>();

        var games = await _db.Games
            .Include(g => g.GamingCategory)
            .AsNoTracking()
            .Where(g => g.GamingCategoryId == categoryId && g.IsActive) // Only active games in active listings
            .OrderBy(g => g.Name)
            .ToListAsync(cancellationToken);

        return games.Select(game => new GameResponse
        {
            Id = game.Id,
            GamingCategoryId = game.GamingCategoryId,
            GamingCategoryName = game.GamingCategory.Name,
            Name = game.Name,
            Description = game.Description,
            IsActive = game.IsActive,
            CreatedAt = game.CreatedAt,
            LastModifiedAt = game.LastModifiedAt
        }).ToList();
    }

    public async Task<Result> SoftDeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var game = await _db.Games.FindAsync(new object[] { id }, cancellationToken);
        if (game == null)
            return Result.Failure($"Game with ID '{id}' not found.");

        // Prevent deletion of a Game if it is assigned to a Gaming Station.
        var isAssignedToGamingStation = await _db.GamingStations.AnyAsync(gs => gs.GameId == id, cancellationToken);
        if (isAssignedToGamingStation)
            return Result.Failure("Cannot delete game as it is assigned to one or more gaming stations.");

        // Prevent deletion of a Game if it is referenced by active bookings.
        // Assuming a Booking entity exists with a GameId.
        // TODO: Implement actual checks for active bookings references.
        // var isReferencedByActiveBookings = await _db.Bookings.AnyAsync(b => b.GameId == id && b.IsActive, cancellationToken);
        // if (isReferencedByActiveBookings)
        //     return Result.Failure("Cannot delete game as it is referenced by active bookings.");

        try
        {
            game.IsActive = false; 
            _db.Games.Update(game);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Game soft deleted successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to soft delete game: {ex.Message}");
        }
    }

    public async Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var game = await _db.Games.FindAsync(new object[] { id }, cancellationToken);
        if (game == null)
            return Result.Failure($"Game with ID '{id}' not found.");

        if (game.IsActive)
            return Result.Failure("Game is already active.");

        try
        {
            game.IsActive = true;
            _db.Games.Update(game);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Game activated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to activate game: {ex.Message}");
        }
    }

    public async Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id is required.");

        var game = await _db.Games.FindAsync(new object[] { id }, cancellationToken);
        if (game == null)
            return Result.Failure($"Game with ID '{id}' not found.");

        if (!game.IsActive)
            return Result.Failure("Game is already inactive.");

        try
        {
            game.IsActive = false;
            _db.Games.Update(game);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Game deactivated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to deactivate game: {ex.Message}");
        }
    }
}