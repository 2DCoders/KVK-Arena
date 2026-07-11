namespace kvk.Gaming.Features.GamingStation;

public class GamingStationResponse
{
    public Guid Id { get; set; }
    public Guid GamingCategoryId { get; set; }
    public string GamingCategoryName { get; set; } = string.Empty;
    public required string StationCode { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
    
    public decimal Price { get; set; }
}


