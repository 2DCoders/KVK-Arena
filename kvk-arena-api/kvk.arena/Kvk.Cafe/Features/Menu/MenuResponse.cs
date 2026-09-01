using kvk.Cafe.Domain;
using Kvk.Cafe.Enums;

namespace kvk.Cafe.Features.Menu;

public class MenuResponse
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public byte[]? Image { get; set; }
    public MenuCategory Category { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string? Facts { get; set; }
    
    public string? Ingredients { get; set; }
    
    public int PreparationTimeInMinutes { get; set; } = 0;
}