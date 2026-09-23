namespace kvk.Gaming.Features.AdditionalPurchase;

public class AdditionalPurchaseResponse
{
    public Guid Id { get; set; }
    
    public required string Name { get; set; }
    
    public decimal Price { get; set; }
    
    public string? Description { get; set; }
    
    public byte[]? Image { get; set; }
    
    public Guid GamingCategoryId { get; set; }
    
    public bool IsActive { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime? LastModifiedAt { get; set; }
}