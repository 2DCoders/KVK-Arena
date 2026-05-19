using Microsoft.Extensions.DependencyInjection;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.ModuleIntegrator;

public class ModuleIntegratorClient : kvk.BuildingBlocks.Interfaces.IModuleIntegratorClient
{
    private readonly IServiceProvider _provider;

    public ModuleIntegratorClient(IServiceProvider provider)
    {
        _provider = provider ?? throw new ArgumentNullException(nameof(provider));
    }

    public async Task PublishStaffAssignedToModuleAsync(kvk.BuildingBlocks.Interfaces.StaffAssignedToModuleEvent evt, CancellationToken cancellationToken = default)
    {
        var handlers = _provider.GetServices<kvk.BuildingBlocks.Interfaces.IStaffAssignedToModuleEventHandler>();
        foreach (var handler in handlers)
        {
            try
            {
                await handler.HandleAsync(evt, cancellationToken);
            }
            catch
            {
                // swallow to avoid breaking publisher
            }
        }
    }
}


