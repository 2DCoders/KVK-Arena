using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Domain;

public class StaffModule : AuditableEntity
{
    public Guid StaffId { get; set; }

    public required string ModuleName { get; set; }

    public bool IsActive { get; set; } = true;

    public Staff? Staff { get; set; }
}

