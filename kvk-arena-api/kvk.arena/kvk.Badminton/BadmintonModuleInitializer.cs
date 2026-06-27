using kvk.Badminton.Features.Court;
using kvk.Badminton.Features.CourtSlotConfiguration;
using kvk.Badminton.Interfaces;
using kvk.Badminton.Services; // Add this using statement
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace kvk.Badminton;

public class BadmintonModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("BadmintonConnection")
                               ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string named 'GymConnection' or 'DefaultConnection' is required.");

        services.AddDbContext<BadmintonDbContext>(options => options.UseNpgsql(connectionString));    
        services.AddScoped<ICourtService, CourtService>();
        services.AddScoped<ICourtSlotConfigurationService, CourtSlotConfigurationService>();
        services.AddScoped<IDayEndService, BadmintonDayEndService>(); // Register the new service

        
            
            
            
            
    }
}