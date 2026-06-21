using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingStation : AuditableEntity
{
    public Guid GamingCategoryId { get; set; }
    
    public Guid GameId { get; set; }

    public Game Game { get; set; } = null!;

    public string StationCode { get; set; }

    public string Name { get; set; }

    public bool IsActive { get; set; }

     public GamingCategory GamingCategory { get; set; }
}