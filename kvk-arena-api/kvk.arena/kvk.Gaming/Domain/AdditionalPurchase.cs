using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Domain;

public class AdditionalPurchase : AuditableEntity
{
    public required string Name { get; set; }
    
    public decimal Price { get; set; }
    
    public string? Description { get; set; }
    
    public byte[]? Image { get; set; }
    
    public Guid GamingCategoryId { get; set; }
    
    public virtual GamingCategory GamingCategory { get; set; } = null!;
    
    public bool IsActive { get; set; }
}