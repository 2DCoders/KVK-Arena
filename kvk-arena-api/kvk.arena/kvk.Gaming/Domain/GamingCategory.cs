using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class GamingCategory : AuditableEntity
{
    [MaxLength(100)]
    public required string Name { get; set; }
    
    // PC, PS5, BILLIARD
    public string Code { get; set; }

    public bool HasGames { get; set; }
    
    public bool IsActive { get; set; }

    
}