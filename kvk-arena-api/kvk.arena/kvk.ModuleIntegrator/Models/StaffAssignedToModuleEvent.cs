namespace kvk.ModuleIntegrator.Models;

public class StaffAssignedToModuleEvent
{
    public string IdentityUserId { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? FullName { get; set; }
    public string[] AssignedModules { get; set; } = System.Array.Empty<string>();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
