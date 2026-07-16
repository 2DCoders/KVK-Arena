namespace kvk.Identity.Features.StaffModule;

/// <summary>
/// Request to assign modules to a staff member.
/// </summary>
public class AssignModulesToStaffRequest
{
    public string[]? ModuleNames { get; set; } = Array.Empty<string>();
}

/// <summary>
/// Response for staff module assignment operations.
/// </summary>
public class StaffModuleResponse
{
    public Guid StaffId { get; set; }
    public string[] AssignedModules { get; set; } = Array.Empty<string>();
    public DateTime LastModified { get; set; }
}