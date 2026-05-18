using kvk.BuildingBlocks.Common;
namespace kvk.Identity.Domain;
public class StaffRole : AuditableEntity
{
    public Guid StaffId { get; set; }
    public Guid RoleId { get; set; }
    public bool IsActive { get; set; } = true;
    public Staff? Staff { get; set; }
    public Role? Role { get; set; }
}
