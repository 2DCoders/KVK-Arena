using kvk.BuildingBlocks.Common;
namespace kvk.Identity.Domain;
public class RolePermission : AuditableEntity
{
    public Guid RoleId { get; set; }
    public required string Code { get; set; }
    public bool IsActive { get; set; } = true;
    public Role? Role { get; set; }
    public ApplicationPermission? ApplicationPermission { get; set; }
}
