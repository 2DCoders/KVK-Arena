namespace kvk.Identity.Features.StaffRole;

public class StaffRoleRequest
{
    public Guid StaffId { get; set; }
    
    public List<Guid> RoleIds { get; set; } = new List<Guid>();
}