namespace kvk.Gaming.Features.GamingCategory;

public class GamingCategoryResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Code { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}