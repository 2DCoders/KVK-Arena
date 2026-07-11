using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;

namespace kvk.BuildingBlocks.Interfaces;

/// <summary>
/// Contract for initializing and registering background processors.
/// Each module implements this interface to define its background job setup.
/// </summary>
public interface IBackgroundProcessorInitializer
{
    /// <summary>
    /// Initializes and registers background jobs for the module.
    /// </summary>
    /// <param name="serviceProvider">The application's service provider.</param>
    /// <param name="logger">Logger for informational messages.</param>
    /// <returns>A Task representing the asynchronous operation.</returns>
    Task InitializeAsync(IServiceProvider serviceProvider, ILogger logger);
}
