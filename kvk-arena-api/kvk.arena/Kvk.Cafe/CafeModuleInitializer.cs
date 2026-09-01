using kvk.BuildingBlocks.Interfaces;
using kvk.CarService;
using kvk.CarService.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Kvk.Cafe;

public class CafeModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CafeConnection")
                               ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string named 'CafeConnection' or 'DefaultConnection' is required.");

        services.AddDbContext<CafeDbContext>(
            options => options.UseNpgsql(connectionString)
                .EnableSensitiveDataLogging()
                .LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
            );
        
        services.AddScoped<CafeDayEndService>(); // Register the new service
    }
}