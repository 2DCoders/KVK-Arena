namespace kvk.Identity.Features.ApplicationPermissions;

public class ApplicationPermissionResponse
{
    public required string Code { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}