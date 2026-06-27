using kvk.BuildingBlocks.Interfaces;
using kvk.Gaming.Features.GamingCategory;
using kvk.Gaming.Features.Game;
using kvk.Gaming.Features.GamingStation;
using kvk.Gaming.Features.GamingStationGameMapping;
using kvk.Gaming.Features.GamingSlotConfiguration;
using kvk.Gaming.Features.GamingSlotGeneration;
using kvk.Gaming.Features.GamingBooking; // Added for GamingBookingService
using kvk.Gaming.Interfaces;
using kvk.Gaming.Services; // Add this using statement
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace kvk.Gaming;

public class GamingModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("GamingConnection")
                               ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string named 'GamingConnection' or 'DefaultConnection' is required.");

        services.AddDbContext<GamingDbContext>(options => options.UseNpgsql(connectionString));
        
        // Register GamingCategoryService
        services.AddScoped<IGamingCategoryService,GamingCategoryService>();
        // Register GameService
        // services.AddScoped<IGameService,GameService>();
        // Register GamingStationService
        services.AddScoped<IGamingStationService, GamingStationService>();
        // Register GamingStationGameMappingService
        // services.AddScoped<IGamingStationGameMappingService, GamingStationGameMappingService>();
        // Register GamingSlotConfigurationService
        // services.AddScoped<IGamingSlotConfigurationService, GamingSlotConfigurationService>();
        // Register GamingSlotGenerationService
        services.AddScoped<IGamingSlotGenerationService, GamingSlotGenerationService>();
        // Register GamingBookingService
        services.AddScoped<IGamingBookingService, GamingBookingService>();
        services.AddScoped<IDayEndService, GamingDayEndService>(); // Register the new service
    }
}