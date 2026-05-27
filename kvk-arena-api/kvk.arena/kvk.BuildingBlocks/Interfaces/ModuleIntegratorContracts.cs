namespace kvk.BuildingBlocks.Interfaces;

public class StaffAssignedToModuleEvent
{
    public string IdentityUserId { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string[] AssignedModules { get; set; } = System.Array.Empty<string>();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public interface IStaffAssignedToModuleEventHandler
{
    Task HandleAsync(StaffAssignedToModuleEvent evt, CancellationToken cancellationToken = default);
}

public interface IModuleIntegratorClient
{
    Task PublishStaffAssignedToModuleAsync(StaffAssignedToModuleEvent evt, CancellationToken cancellationToken = default);
}
