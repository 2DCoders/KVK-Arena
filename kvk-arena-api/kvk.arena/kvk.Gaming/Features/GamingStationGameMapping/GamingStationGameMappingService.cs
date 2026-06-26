// using kvk.BuildingBlocks.Common;
// using kvk.Gaming.Domain;
// using kvk.Gaming;
// using kvk.Gaming.Interfaces;
// using Microsoft.EntityFrameworkCore;
//
// namespace kvk.Gaming.Features.GamingStationGameMapping;
//
// public class GamingStationGameMappingService : IGamingStationGameMappingService
// {
//     private readonly GamingDbContext _db;
//
//     public GamingStationGameMappingService(GamingDbContext db)
//     {
//         _db = db ?? throw new ArgumentNullException(nameof(db));
//     }
//
//     //not wanted
//     public async Task<Result> AssignGamesToGamingStationAsync(AssignGamesToGamingStationRequest request, CancellationToken cancellationToken = default)
//     {
//         if (request == null)
//             return Result.Failure("Request cannot be null.");
//
//         if (request.GamingStationId == Guid.Empty)
//             return Result.Failure("Gaming Station ID is required.");
//
//         if (!request.GameIds.Any())
//             return Result.Failure("At least one Game ID is required for assignment.");
//
//         var gamingStation = await _db.GamingStations
//             .Include(gs => gs.GamingCategory)
//             .SingleOrDefaultAsync(gs => gs.Id == request.GamingStationId, cancellationToken);
//
//         if (gamingStation == null)
//             return Result.Failure($"Gaming Station with ID '{request.GamingStationId}' not found.");
//
//         if (!gamingStation.IsActive)
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive. Cannot assign games.");
//
//         if (!gamingStation.GamingCategory.HasGames)
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' belongs to category '{gamingStation.GamingCategory.Name}' which does not support game mappings.");
//         
//         // Assuming 'POOL' is a specific code for categories that must not allow game mappings
//         if (gamingStation.GamingCategory.Code == "POOL") 
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' belongs to the 'POOL' category and must not allow game mappings.");
//
//         var games = await _db.Games
//             .Where(g => request.GameIds.Contains(g.Id))
//             .ToListAsync(cancellationToken);
//
//         if (games.Count != request.GameIds.Count)
//             return Result.Failure("One or more provided Game IDs are invalid or not found.");
//
//         var inactiveGames = games.Where(g => !g.IsActive).ToList();
//         if (inactiveGames.Any())
//             return Result.Failure($"Cannot assign inactive games: {string.Join(", ", inactiveGames.Select(g => g.Name))}.");
//
//         // var gamesNotInSameCategory = games.Where(g => g.GamingCategoryId != gamingStation.GamingCategoryId).ToList();
//         // if (gamesNotInSameCategory.Any())
//         //     return Result.Failure($"Games must belong to the same category as the station. Games '{string.Join(", ", gamesNotInSameCategory.Select(g => g.Name))}' are in different categories.");
//
//         var existingMappings = await _db.GamingStationGames
//             .Where(gsg => gsg.GamingStationId == request.GamingStationId && request.GameIds.Contains(gsg.GameId))
//             .Select(gsg => gsg.GameId)
//             .ToListAsync(cancellationToken);
//
//         var newMappings = new List<GamingStationGame>();
//         foreach (var gameId in request.GameIds)
//         {
//             if (!existingMappings.Contains(gameId))
//             {
//                 newMappings.Add(new GamingStationGame
//                 {
//                     GamingStationId = request.GamingStationId,
//                     GameId = gameId
//                 });
//             }
//         }
//
//         if (!newMappings.Any())
//             return Result.Success("All specified games are already assigned to this station.");
//
//         try
//         {
//             _db.GamingStationGames.AddRange(newMappings);
//             await _db.SaveChangesAsync(cancellationToken);
//             return Result.Success("Games assigned to gaming station successfully.");
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to assign games to gaming station: {ex.Message}");
//         }
//     }
//
//     public async Task<Result> ReplaceGamesForGamingStationAsync(ReplaceGamesForGamingStationRequest request, CancellationToken cancellationToken = default)
//     {
//         if (request == null)
//             return Result.Failure("Request cannot be null.");
//
//         if (request.GamingStationId == Guid.Empty)
//             return Result.Failure("Gaming Station ID is required.");
//
//         var gamingStation = await _db.GamingStations
//             .Include(gs => gs.GamingCategory)
//             .SingleOrDefaultAsync(gs => gs.Id == request.GamingStationId, cancellationToken);
//
//         if (gamingStation == null)
//             return Result.Failure($"Gaming Station with ID '{request.GamingStationId}' not found.");
//
//         if (!gamingStation.IsActive)
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive. Cannot replace games.");
//
//         if (!gamingStation.GamingCategory.HasGames)
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' belongs to category '{gamingStation.GamingCategory.Name}' which does not support game mappings.");
//
//         if (gamingStation.GamingCategory.Code == "POOL")
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' belongs to the 'POOL' category and must not allow game mappings.");
//
//         // Validate new games
//         var newGames = await _db.Games
//             .Where(g => request.NewGameIds.Contains(g.Id))
//             .ToListAsync(cancellationToken);
//
//         if (request.NewGameIds.Any() && newGames.Count != request.NewGameIds.Count)
//             return Result.Failure("One or more provided New Game IDs are invalid or not found.");
//
//         var inactiveNewGames = newGames.Where(g => !g.IsActive).ToList();
//         if (inactiveNewGames.Any())
//             return Result.Failure($"Cannot assign inactive games: {string.Join(", ", inactiveNewGames.Select(g => g.Name))}.");
//
//         // var newGamesNotInSameCategory = newGames.Where(g => g.GamingCategoryId != gamingStation.GamingCategoryId).ToList();
//         // if (newGamesNotInSameCategory.Any())
//         //     return Result.Failure($"New games must belong to the same category as the station. Games '{string.Join(", ", newGamesNotInSameCategory.Select(g => g.Name))}' are in different categories.");
//
//         try
//         {
//             // Remove existing mappings for the station
//             var existingMappings = await _db.GamingStationGames
//                 .Where(gsg => gsg.GamingStationId == request.GamingStationId)
//                 .ToListAsync(cancellationToken);
//             _db.GamingStationGames.RemoveRange(existingMappings);
//
//             // Add new mappings
//             var newMappings = request.NewGameIds.Select(gameId => new GamingStationGame
//             {
//                 GamingStationId = request.GamingStationId,
//                 GameId = gameId
//             }).ToList();
//             _db.GamingStationGames.AddRange(newMappings);
//
//             await _db.SaveChangesAsync(cancellationToken);
//             return Result.Success("Games replaced for gaming station successfully.");
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to replace games for gaming station: {ex.Message}");
//         }
//     }
//
//     public async Task<Result> RemoveGameFromGamingStationAsync(RemoveGameFromGamingStationRequest request, CancellationToken cancellationToken = default)
//     {
//         if (request == null)
//             return Result.Failure("Request cannot be null.");
//
//         if (request.GamingStationId == Guid.Empty)
//             return Result.Failure("Gaming Station ID is required.");
//
//         if (request.GameId == Guid.Empty)
//             return Result.Failure("Game ID is required.");
//
//         var mapping = await _db.GamingStationGames
//             .SingleOrDefaultAsync(gsg => gsg.GamingStationId == request.GamingStationId && gsg.GameId == request.GameId, cancellationToken);
//
//         if (mapping == null)
//             return Result.Failure($"Game '{request.GameId}' is not assigned to Gaming Station '{request.GamingStationId}'.");
//
//         try
//         {
//             _db.GamingStationGames.Remove(mapping);
//             await _db.SaveChangesAsync(cancellationToken);
//             return Result.Success("Game removed from gaming station successfully.");
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to remove game from gaming station: {ex.Message}");
//         }
//     }
//
//     public async Task<List<GamingStationGameMappingResponse>> GetGamesByGamingStationAsync(Guid gamingStationId, CancellationToken cancellationToken = default)
//     {
//         if (gamingStationId == Guid.Empty)
//             return new List<GamingStationGameMappingResponse>();
//
//         var mappings = await _db.GamingStationGames
//             .Where(gsg => gsg.GamingStationId == gamingStationId)
//             .Include(gsg => gsg.GamingStation)
//             .Include(gsg => gsg.Game)
//             .AsNoTracking()
//             .ToListAsync(cancellationToken);
//
//         return mappings.Select(gsg => new GamingStationGameMappingResponse
//         {
//             GamingStationId = gsg.GamingStationId,
//             GamingStationName = gsg.GamingStation.Name,
//             GameId = gsg.GameId,
//             GameName = gsg.Game.Name,
//             CreatedAt = gsg.CreatedAt
//         }).ToList();
//     }
//
//     public async Task<List<GamingStationGameMappingResponse>> GetGamingStationsByGameAsync(Guid gameId, CancellationToken cancellationToken = default)
//     {
//         if (gameId == Guid.Empty)
//             return new List<GamingStationGameMappingResponse>();
//
//         var mappings = await _db.GamingStationGames
//             .Where(gsg => gsg.GameId == gameId)
//             .Include(gsg => gsg.GamingStation)
//             .Include(gsg => gsg.Game)
//             .AsNoTracking()
//             .ToListAsync(cancellationToken);
//
//         return mappings.Select(gsg => new GamingStationGameMappingResponse
//         {
//             GamingStationId = gsg.GamingStationId,
//             GamingStationName = gsg.GamingStation.Name,
//             GameId = gsg.GameId,
//             GameName = gsg.Game.Name,
//             CreatedAt = gsg.CreatedAt
//         }).ToList();
//     }
// }