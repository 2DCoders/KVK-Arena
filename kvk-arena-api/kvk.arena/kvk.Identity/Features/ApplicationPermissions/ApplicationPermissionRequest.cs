namespace kvk.Identity.Features.ApplicationPermissions;

public class ApplicationPermissionRequest
{
    public required string Code { get; set; }
    public string? Description { get; set; }
}