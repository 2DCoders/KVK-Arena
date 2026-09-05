using kvk.BuildingBlocks.Interfaces;
using Kvk.Cafe;
using kvk.Saloon.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace kvk.Saloon;

public class SaloonModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("SaloonConnection")
                               ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string named 'SaloonConnection' or 'DefaultConnection' is required.");

        services.AddDbContext<SaloonDbContext>(
            options => options.UseNpgsql(connectionString)
                .EnableSensitiveDataLogging()
                .LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
            );
        
        services.AddScoped<SaloonDayEndService>(); // Register the new service

    }
}