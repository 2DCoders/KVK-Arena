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
        

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required.");
        
        byte[] imageBytes = [];
        if (request.Image is not null && request.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
        }
        
        
        try
        {
            var game = new Domain.Game
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive,
                Image = imageBytes,
                
            };

            _db.Games.Add(game);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GameResponse
            {
                Id = game.Id,
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

        byte[] imageBytes = [];
        if (request.Image is not null && request.Image.Length > 0)
        {
            using var memoryStream = new MemoryStream();
            await request.Image.CopyToAsync(memoryStream, cancellationToken);
            imageBytes = memoryStream.ToArray();
            existingGame.Image = imageBytes;
        }
        
        try
        {
            existingGame.Name = request.Name;
            existingGame.Description = request.Description;
            existingGame.IsActive = request.IsActive;

            _db.Games.Update(existingGame);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new GameResponse
            {
                Id = existingGame.Id,
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
            .AsNoTracking()
            .SingleOrDefaultAsync(g => g.Id == id, cancellationToken);

        if (game == null)
            return null;

        return new GameResponse
        {
            Id = game.Id,
            Name = game.Name,
            Description = game.Description,
            IsActive = game.IsActive,
            Image = game.Image,

        };
    }

    public async Task<List<GameResponse>> GetListAsync(GameListRequest request, CancellationToken cancellationToken = default)
    {
        var query = _db.Games
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(g => g.Name.Contains(request.SearchTerm) || g.Description!.Contains(request.SearchTerm));
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
        
        var games = await query
            .OrderBy(g => g.Name)
            .ToListAsync(cancellationToken);

        var responses = games.Select(game => new GameResponse
        {
            Id = game.Id,
            Name = game.Name,
            Description = game.Description,
            Image = game.Image,
            IsActive = game.IsActive,
            CreatedAt = game.CreatedAt,
            LastModifiedAt = game.LastModifiedAt
        }).ToList();

        return responses;
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
    
    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
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
            _db.Games.Remove(game);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Game deactivated successfully.");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to deactivate game: {ex.Message}");
        }
    }
}