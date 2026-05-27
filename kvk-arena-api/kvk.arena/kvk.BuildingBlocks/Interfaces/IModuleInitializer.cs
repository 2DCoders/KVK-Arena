using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace kvk.BuildingBlocks.Interfaces;

/// <summary>
/// Contract for module initialization and service registration.
/// Each module implements this interface to register its services and DbContext during application startup.
/// </summary>
public interface IModuleInitializer
{
    /// <summary>
    /// Registers module services, DbContext, repositories, and other dependencies in the DI container.
    /// Called during application startup from kvk.Host/Program.cs.
    /// </summary>
    /// <param name="services">Service collection for DI registration</param>
    /// <param name="configuration">Application configuration</param>
    void RegisterModule(IServiceCollection services, IConfiguration configuration);
}



