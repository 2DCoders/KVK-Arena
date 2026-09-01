using kvk.Cafe.Domain;
using Kvk.Cafe.Enums;
using Microsoft.AspNetCore.Http;

namespace kvk.Cafe.Features.Menu;

public class MenuCreateRequest
{
    public required string Name { get; set; }
    public IFormFile? Image { get; set; }
    public MenuCategory Category { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public string? Facts { get; set; }
    
    public string? Ingredients { get; set; }
    
    public int PreparationTimeInMinutes { get; set; } = 0;
}