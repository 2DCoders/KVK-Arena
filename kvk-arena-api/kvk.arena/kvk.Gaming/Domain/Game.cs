using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class Game : AuditableEntity
{
    public Guid GamingCategoryId { get; set; }

    public string Name { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; }
}