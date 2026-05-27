using kvk.BuildingBlocks.Interfaces;
using kvk.Gym.Services;
using kvk.Gym.Interfaces;
using kvk.Gym.Options;
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

        services.Configure<GymDayEndOptions>(configuration.GetSection(GymDayEndOptions.SectionName));
        services.AddScoped<SystemSettingRolloverService>();

        // Register services
        services.AddScoped<IMembershipService, MembershipService>();
        services.AddScoped<IAttendanceService, AttendanceService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IMembershipPlanService, MembershipPlanService>();
        services.AddScoped<IDayPassMemberService, DayPassMemberService>();
        // Use module adapter that wires the generic DayEnd service to GymDbContext
        services.AddScoped<IDayEndService, GymDayEndService>();
        // Register integrator event handlers (building-blocks contract)
        services.AddScoped<IStaffAssignedToModuleEventHandler, EventHandlers.StaffAssignedToModuleEventHandler>();
    }
}
