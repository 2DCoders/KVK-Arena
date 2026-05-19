using kvk.ModuleIntegrator.Models;

namespace kvk.ModuleIntegrator;

public interface IModuleIntegratorClient
{
    Task PublishStaffAssignedToModuleAsync(StaffAssignedToModuleEvent evt, CancellationToken cancellationToken = default);
}
