namespace kvk.Gaming.Features.AdditionalPurchase;

public class AdditionalPurchaseCreateRequest
{
    public required string Name { get; set; }
    
    public decimal Price { get; set; }
    
    public string? Description { get; set; }
    
    public byte[]? Image { get; set; }
    
    public Guid GamingCategoryId { get; set; }
}