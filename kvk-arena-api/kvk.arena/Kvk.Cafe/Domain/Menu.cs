using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
using Kvk.Cafe.Enums;

namespace kvk.Cafe.Domain;

public class Menu : AuditableEntity
{
 
    [MaxLength(100)]
    public required string Name { get; set; }
    
    public byte[]? Image { get; set; }
    
    public MenuCategory Category { get; set; }
    
    public decimal Price { get; set; }
    [MaxLength(1000)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; }
    [MaxLength(500)]
    public string? Facts { get; set; }
    
    [MaxLength(1000)]
    public string? Ingredients { get; set; }

    public int PreparationTimeInMinutes { get; set; } = 0;
    
    public PortionSize PortionSize { get; set; } = PortionSize.Unknown;
}