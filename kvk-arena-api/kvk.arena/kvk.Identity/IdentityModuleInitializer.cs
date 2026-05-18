using kvk.BuildingBlocks.Auth;
using kvk.BuildingBlocks.Interfaces;
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
    }
}