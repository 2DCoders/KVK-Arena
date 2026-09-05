using kvk.BuildingBlocks.Interfaces;
using Kvk.Cafe;
using kvk.Saloon.Features.Booking;
using kvk.Saloon.Features.Saloon;
using kvk.Saloon.Features.SaloonSlotConfiguration;
using kvk.Saloon.Features.ServiceItem;
using kvk.Saloon.Features.Staff;
using kvk.Saloon.Features.StaffSchedule;
using kvk.Saloon.Interfaces;
using kvk.Saloon.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

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
                .LogTo(Console.WriteLine, LogLevel.Information)
            );
        
        services.AddScoped<ISaloonService, SaloonService>();
        services.AddScoped<ISaloonStaffService, SaloonStaffService>();
        services.AddScoped<ISaloonServiceItemService, SaloonServiceItemService>();
        services.AddScoped<ISaloonStaffScheduleService, SaloonStaffScheduleService>();
        services.AddScoped<ISaloonSlotConfigurationService, SaloonSlotConfigurationService>();
        services.AddScoped<ISaloonBookingService, SaloonBookingService>();
        services.AddScoped<SaloonDayEndService>(); // Register the new service

    }
}