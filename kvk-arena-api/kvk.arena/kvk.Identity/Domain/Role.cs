using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
namespace kvk.Identity.Domain;
public class Role : AuditableEntity
{
    [MaxLength(100)]
    public required string Name { get; set; }
    [MaxLength(500)]
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<StaffRole> StaffRoles { get; set; } = new List<StaffRole>();
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
