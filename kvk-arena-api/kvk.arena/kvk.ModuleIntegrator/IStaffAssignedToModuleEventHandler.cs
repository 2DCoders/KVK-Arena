using kvk.ModuleIntegrator.Models;

namespace kvk.ModuleIntegrator;

public interface IStaffAssignedToModuleEventHandler
{
    Task HandleAsync(StaffAssignedToModuleEvent evt, CancellationToken cancellationToken = default);
}
