using kvk.BuildingBlocks.Auth;
using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Features.Auth;
using kvk.Identity.Features.StaffModule;
using kvk.Identity.Features.Role;
using kvk.Identity.Persistence;
using kvk.Identity.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace kvk.Identity;

public class IdentityModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("IdentityConnection")
            ?? configuration.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("A connection string named 'IdentityConnection' or 'DefaultConnection' is required.");
        }

        services.AddDbContext<IdentityApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IPermissionAuthorizationService, PermissionAuthorizationService>();
        services.AddScoped<AuthService>();
        services.AddScoped<RoleService>();
        services.AddScoped<StaffModuleService>();
        services.AddScoped<IHolidayService, HolidayService>();
        // Module integrator client to publish integration events (building-blocks contract)
        services.AddScoped<IModuleIntegratorClient, ModuleIntegrator.ModuleIntegratorClient>();
        services.AddScoped<IdentitySeeder>();
        // JWT service from BuildingBlocks - simple dev implementation registered here
        services.AddSingleton<IJwtService, JwtService>();
    }
}