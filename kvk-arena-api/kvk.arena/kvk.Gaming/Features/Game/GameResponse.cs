namespace kvk.Gaming.Features.Game;

public class GameResponse
{
    public Guid Id { get; set; }
    public Guid GamingCategoryId { get; set; }
    public string GamingCategoryName { get; set; } = string.Empty;
    public required string Name { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}