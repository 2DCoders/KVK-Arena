using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
namespace kvk.Identity.Domain;
public class ApplicationPermission : AuditableEntity
{
    [MaxLength(150)]
    public required string Code { get; set; }
    [MaxLength(500)]
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
