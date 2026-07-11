using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

//no need
public class Game : AuditableEntity
{
    public string Name { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; }
}