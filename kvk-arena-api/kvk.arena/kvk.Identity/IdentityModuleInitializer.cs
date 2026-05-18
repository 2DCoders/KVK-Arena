using kvk.BuildingBlocks.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace kvk.Identity;

/// <summary>
/// Module initializer for the Identity module.
/// Registers Identity-related services, DbContext, and other dependencies in the DI container.
/// Called during application startup from kvk.Host/Program.cs.
/// 
/// Implementation Status: PLACEHOLDER
/// Phase 2 will implement full Identity services (User, Role, Authentication).
/// </summary>
public class IdentityModuleInitializer : IModuleInitializer
{
    /// <summary>
    /// Registers Identity module services and DbContext.
    /// Currently a placeholder - will be fully implemented in Phase 2.
    /// </summary>
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        // TODO Phase 2:
        // 1. Register IdentityApplicationDbContext
        // 2. Register User/Role services
        // 3. Configure authentication/JWT
        // 4. Add any Identity-specific middleware
        
        // Placeholder log
        var logger = services.BuildServiceProvider().GetRequiredService<ILogger<IdentityModuleInitializer>>();
        logger.LogInformation("Identity module registered (Phase 2 implementation pending)");
    }
}