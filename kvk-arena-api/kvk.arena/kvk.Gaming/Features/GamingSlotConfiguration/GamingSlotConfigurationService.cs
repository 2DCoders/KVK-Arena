// using kvk.BuildingBlocks.Common;
// using kvk.Gaming.Interfaces;
// using Microsoft.EntityFrameworkCore;
//
// namespace kvk.Gaming.Features.GamingSlotConfiguration;
//
// public class GamingSlotConfigurationService : IGamingSlotConfigurationService
// {
//     private readonly GamingDbContext _db;
//
//     public GamingSlotConfigurationService(GamingDbContext db)
//     {
//         _db = db ?? throw new ArgumentNullException(nameof(db));
//     }
//
//     public async Task<Result> CreateAsync(GamingSlotConfigurationCreateRequest request, CancellationToken cancellationToken = default)
//     {
//         if (request == null)
//             return Result.Failure("Request cannot be null.");
//
//         if (request.GamingStationId == Guid.Empty)
//             return Result.Failure("Gaming Station ID is required.");
//
//         if (request.StartTime >= request.EndTime)
//             return Result.Failure("Start Time must be earlier than End Time.");
//
//         if (request.SlotDurationMinutes <= 0)
//             return Result.Failure("Slot Duration must be greater than zero.");
//
//         if (request.SlotGapMinutes < 0)
//             return Result.Failure("Slot Gap must be zero or greater.");
//
//         if (request.Price <= 0)
//             return Result.Failure("Price must be greater than zero.");
//
//         var gamingStation = await _db.GamingStations
//             .Include(gs => gs.GamingCategory)
//             .SingleOrDefaultAsync(gs => gs.Id == request.GamingStationId, cancellationToken);
//
//         if (gamingStation == null)
//             return Result.Failure($"Gaming Station with ID '{request.GamingStationId}' not found.");
//
//         if (!gamingStation.IsActive)
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive. Cannot create slot configuration.");
//
//         // Each Gaming Station can have only one active Slot Configuration at a time.
//         if (request.IsActive && await _db.GamingSlotConfigurations.AnyAsync(gsc => gsc.GamingCategoryId == request.GamingStationId && gsc.IsActive, cancellationToken))
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' already has an active slot configuration. Deactivate the existing one before creating a new active configuration.");
//
//         // Prevent overlapping or conflicting configurations for the same station.
//         // This check is for time overlaps, assuming configurations are for daily schedules.
//         var conflictingConfig = await _db.GamingSlotConfigurations
//             .Where(gsc => gsc.GamingCategoryId == request.GamingStationId && gsc.IsActive &&
//                           ((request.StartTime < gsc.EndTime && request.EndTime > gsc.StartTime) ||
//                            (gsc.StartTime < request.EndTime && gsc.EndTime > request.StartTime)))
//             .FirstOrDefaultAsync(cancellationToken);
//
//         if (conflictingConfig != null)
//             return Result.Failure($"Conflicting active slot configuration found for Gaming Station '{gamingStation.Name}'. Configuration '{conflictingConfig.Id}' overlaps with the requested time range.");
//
//         // Pool stations must use fixed pricing without game dependency.
//         // This rule implies that for Pool stations, the price might be fixed and not depend on games.
//         // For now, we just ensure the price is > 0, as per general rule.
//         // If there's a specific "fixed price" mechanism for pool stations, it would be implemented here.
//         if (gamingStation.GamingCategory.Code == "POOL" && request.Price <= 0)
//         {
//             return Result.Failure("Pool stations must have a price greater than zero.");
//         }
//
//         try
//         {
//             var slotConfiguration = new Domain.GamingSlotConfiguration
//             {
//                 GamingCategoryId = request.GamingStationId,
//                 StartTime = request.StartTime,
//                 EndTime = request.EndTime,
//                 SlotDurationMinutes = request.SlotDurationMinutes,
//                 SlotGapMinutes = request.SlotGapMinutes,
//                 Price = request.Price,
//                 IsActive = request.IsActive
//             };
//
//             _db.GamingSlotConfigurations.Add(slotConfiguration);
//             await _db.SaveChangesAsync(cancellationToken);
//
//             var response = new GamingSlotConfigurationResponse
//             {
//                 Id = slotConfiguration.Id,
//                 GamingStationId = slotConfiguration.GamingCategoryId,
//                 GamingCategoryName = gamingStation.Name,
//                 StartTime = slotConfiguration.StartTime,
//                 EndTime = slotConfiguration.EndTime,
//                 SlotDurationMinutes = slotConfiguration.SlotDurationMinutes,
//                 SlotGapMinutes = slotConfiguration.SlotGapMinutes,
//                 Price = slotConfiguration.Price,
//                 IsActive = slotConfiguration.IsActive,
//                 CreatedAt = slotConfiguration.CreatedAt,
//                 LastModifiedAt = slotConfiguration.LastModifiedAt
//             };
//
//             return Result.Success("Gaming slot configuration created successfully.")
//                 .WithData("response", response);
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to create gaming slot configuration: {ex.Message}");
//         }
//     }
//
//     public async Task<Result> UpdateAsync(GamingSlotConfigurationUpdateRequest request, CancellationToken cancellationToken = default)
//     {
//         if (request == null)
//             return Result.Failure("Request cannot be null.");
//
//         if (request.Id == Guid.Empty)
//             return Result.Failure("Id is required.");
//
//         if (request.GamingStationId == Guid.Empty)
//             return Result.Failure("Gaming Station ID is required.");
//
//         if (request.StartTime >= request.EndTime)
//             return Result.Failure("Start Time must be earlier than End Time.");
//
//         if (request.SlotDurationMinutes <= 0)
//             return Result.Failure("Slot Duration must be greater than zero.");
//
//         if (request.SlotGapMinutes < 0)
//             return Result.Failure("Slot Gap must be zero or greater.");
//
//         if (request.Price <= 0)
//             return Result.Failure("Price must be greater than zero.");
//
//         var existingConfig = await _db.GamingSlotConfigurations.FindAsync(new object[] { request.Id }, cancellationToken);
//         if (existingConfig == null)
//             return Result.Failure($"Gaming Slot Configuration with ID '{request.Id}' not found.");
//
//         var gamingStation = await _db.GamingStations
//             .Include(gs => gs.GamingCategory)
//             .SingleOrDefaultAsync(gs => gs.Id == request.GamingStationId, cancellationToken);
//
//         if (gamingStation == null)
//             return Result.Failure($"Gaming Station with ID '{request.GamingStationId}' not found.");
//
//         if (!gamingStation.IsActive)
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' is inactive. Cannot update slot configuration.");
//
//         // Each Gaming Station can have only one active Slot Configuration at a time.
//         if (request.IsActive && await _db.GamingSlotConfigurations.AnyAsync(gsc => gsc.Id != request.Id && gsc.GamingCategoryId == request.GamingStationId && gsc.IsActive, cancellationToken))
//             return Result.Failure($"Gaming Station '{gamingStation.Name}' already has another active slot configuration. Deactivate the existing one before activating this configuration.");
//
//         // Prevent overlapping or conflicting configurations for the same station.
//         var conflictingConfig = await _db.GamingSlotConfigurations
//             .Where(gsc => gsc.Id != request.Id && gsc.GamingCategoryId == request.GamingStationId && gsc.IsActive &&
//                           ((request.StartTime < gsc.EndTime && request.EndTime > gsc.StartTime) ||
//                            (gsc.StartTime < request.EndTime && gsc.EndTime > request.StartTime)))
//             .FirstOrDefaultAsync(cancellationToken);
//
//         if (conflictingConfig != null)
//             return Result.Failure($"Conflicting active slot configuration found for Gaming Station '{gamingStation.Name}'. Configuration '{conflictingConfig.Id}' overlaps with the requested time range.");
//
//         if (gamingStation.GamingCategory.Code == "POOL" && request.Price <= 0)
//         {
//             return Result.Failure("Pool stations must have a price greater than zero.");
//         }
//
//         try
//         {
//             existingConfig.GamingCategoryId = request.GamingStationId;
//             existingConfig.StartTime = request.StartTime;
//             existingConfig.EndTime = request.EndTime;
//             existingConfig.SlotDurationMinutes = request.SlotDurationMinutes;
//             existingConfig.SlotGapMinutes = request.SlotGapMinutes;
//             existingConfig.Price = request.Price;
//             existingConfig.IsActive = request.IsActive;
//
//             _db.GamingSlotConfigurations.Update(existingConfig);
//             await _db.SaveChangesAsync(cancellationToken);
//
//             var response = new GamingSlotConfigurationResponse
//             {
//                 Id = existingConfig.Id,
//                 GamingStationId = existingConfig.GamingCategoryId,
//                 GamingCategoryName = gamingStation.Name,
//                 StartTime = existingConfig.StartTime,
//                 EndTime = existingConfig.EndTime,
//                 SlotDurationMinutes = existingConfig.SlotDurationMinutes,
//                 SlotGapMinutes = existingConfig.SlotGapMinutes,
//                 Price = existingConfig.Price,
//                 IsActive = existingConfig.IsActive,
//                 CreatedAt = existingConfig.CreatedAt,
//                 LastModifiedAt = existingConfig.LastModifiedAt
//             };
//
//             return Result.Success("Gaming slot configuration updated successfully.")
//                 .WithData("response", response);
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to update gaming slot configuration: {ex.Message}");
//         }
//     }
//
//     public async Task<List<GamingSlotConfigurationResponse>> GetByGamingStationAsync(Guid gamingStationId, CancellationToken cancellationToken = default)
//     {
//         if (gamingStationId == Guid.Empty)
//             return new List<GamingSlotConfigurationResponse>();
//
//         var configurations = await _db.GamingSlotConfigurations
//             .Where(gsc => gsc.GamingCategoryId == gamingStationId)
//             .Include(gsc => gsc.GamingCategory)
//             .AsNoTracking()
//             .OrderByDescending(gsc => gsc.IsActive)
//             .ThenBy(gsc => gsc.StartTime)
//             .ToListAsync(cancellationToken);
//
//         return configurations.Select(gsc => new GamingSlotConfigurationResponse
//         {
//             Id = gsc.Id,
//             GamingStationId = gsc.GamingCategoryId,
//             GamingCategoryName = gsc.GamingCategory.Name,
//             StartTime = gsc.StartTime,
//             EndTime = gsc.EndTime,
//             SlotDurationMinutes = gsc.SlotDurationMinutes,
//             SlotGapMinutes = gsc.SlotGapMinutes,
//             Price = gsc.Price,
//             IsActive = gsc.IsActive,
//             CreatedAt = gsc.CreatedAt,
//             LastModifiedAt = gsc.LastModifiedAt
//         }).ToList();
//     }
//
//     public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
//     {
//         if (id == Guid.Empty)
//             return Result.Failure("Id is required.");
//
//         var configuration = await _db.GamingSlotConfigurations.FindAsync(new object[] { id }, cancellationToken);
//         if (configuration == null)
//             return Result.Failure($"Gaming Slot Configuration with ID '{id}' not found.");
//
//         // Deleting a configuration must invalidate future slot generation logic.
//         // This implies that any future slots generated by this configuration should be marked as unavailable or removed.
//         // For now, we just delete the configuration. Actual slot invalidation logic would be more complex.
//         // TODO: Implement logic to invalidate future slots generated by this configuration.
//
//         try
//         {
//             _db.GamingSlotConfigurations.Remove(configuration);
//             await _db.SaveChangesAsync(cancellationToken);
//             return Result.Success("Gaming slot configuration deleted successfully.");
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to delete gaming slot configuration: {ex.Message}");
//         }
//     }
//
//     public async Task<Result> ActivateAsync(Guid id, CancellationToken cancellationToken = default)
//     {
//         if (id == Guid.Empty)
//             return Result.Failure("Id is required.");
//
//         var configuration = await _db.GamingSlotConfigurations.FindAsync(new object[] { id }, cancellationToken);
//         if (configuration == null)
//             return Result.Failure($"Gaming Slot Configuration with ID '{id}' not found.");
//
//         if (configuration.IsActive)
//             return Result.Success("Gaming slot configuration is already active.");
//
//         // Each Gaming Station can have only one active Slot Configuration at a time.
//         if (await _db.GamingSlotConfigurations.AnyAsync(gsc => gsc.GamingCategoryId == configuration.GamingCategoryId && gsc.IsActive, cancellationToken))
//             return Result.Failure($"Gaming Station '{configuration.GamingCategoryId}' already has an active slot configuration. Deactivate the existing one before activating this configuration.");
//
//         try
//         {
//             configuration.IsActive = true;
//             _db.GamingSlotConfigurations.Update(configuration);
//             await _db.SaveChangesAsync(cancellationToken);
//             return Result.Success("Gaming slot configuration activated successfully.");
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to activate gaming slot configuration: {ex.Message}");
//         }
//     }
//
//     public async Task<Result> DeactivateAsync(Guid id, CancellationToken cancellationToken = default)
//     {
//         if (id == Guid.Empty)
//             return Result.Failure("Id is required.");
//
//         var configuration = await _db.GamingSlotConfigurations.FindAsync(new object[] { id }, cancellationToken);
//         if (configuration == null)
//             return Result.Failure($"Gaming Slot Configuration with ID '{id}' not found.");
//
//         if (!configuration.IsActive)
//             return Result.Success("Gaming slot configuration is already inactive.");
//
//         // Deactivating a configuration must invalidate future slot generation logic.
//         // TODO: Implement logic to invalidate future slots generated by this configuration.
//
//         try
//         {
//             configuration.IsActive = false;
//             _db.GamingSlotConfigurations.Update(configuration);
//             await _db.SaveChangesAsync(cancellationToken);
//             return Result.Success("Gaming slot configuration deactivated successfully.");
//         }
//         catch (Exception ex)
//         {
//             return Result.Failure($"Failed to deactivate gaming slot configuration: {ex.Message}");
//         }
//     }
// }