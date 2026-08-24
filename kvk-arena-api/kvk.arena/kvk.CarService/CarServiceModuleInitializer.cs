using kvk.BuildingBlocks.Interfaces;
using kvk.CarService.Features.CarWashOrder;
using kvk.CarService.Features.CarWashService;
using kvk.CarService.Interfaces;
using kvk.CarService.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PackageService = kvk.CarService.Features.PackageService.PackageService;

namespace kvk.CarService;

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
        services.AddScoped<ICarWashOrderService,CarWashOrderService>();
        services.AddScoped<IDayEndService, CarServiceDayEndService>(); // Register the new service
    }
}