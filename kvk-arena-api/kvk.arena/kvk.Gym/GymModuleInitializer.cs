using kvk.BuildingBlocks.Interfaces;
using kvk.Gym.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gym;

public class GymModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("GymConnection")
            ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("A connection string named 'GymConnection' or 'DefaultConnection' is required.");

        services.AddDbContext<GymDbContext>(options => options.UseNpgsql(connectionString));

        // Register services
        services.AddScoped<IMembershipService, MembershipService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IMembershipPlanService, MembershipPlanService>();
        // Register integrator event handlers (building-blocks contract)
        services.AddScoped<IStaffAssignedToModuleEventHandler, EventHandlers.StaffAssignedToModuleEventHandler>();
    }
}


