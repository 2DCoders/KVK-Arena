using kvk.BuildingBlocks.Interfaces;
using kvk.CarService;
using kvk.CarService.Features.CarWashService;
using kvk.CarService.Features.PackageService;
using kvk.CarService.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace kvk.Gaming;

public class CarServiceModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CarServiceConnection")
                               ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string named 'CarServiceConnection' or 'DefaultConnection' is required.");

        services.AddDbContext<CarServiceDbContext>(
            options => options.UseNpgsql(connectionString)
                .EnableSensitiveDataLogging()
                .LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
            );
        
        // services.AddScoped<IDayEndService, CarSer>(); // Register the new service

        services.AddScoped<ICarWashService, CarWashService>();
        services.AddScoped<IPackageService, PackageService>();
    }
}