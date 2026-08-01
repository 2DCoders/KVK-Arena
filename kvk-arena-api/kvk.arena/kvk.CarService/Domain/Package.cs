using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;

namespace kvk.CarService.Domain;

public class Package : AuditableEntity
{
    [MaxLength(100)]
    public required string Title { get; set; }
    [MaxLength(250)]
    public string? Description { get; set; }

    public int? DurationInMinutes { get; set; } = 0;

    public List<PackageService> PackageServices { get; set; } = new List<PackageService>();
    
    public byte[]? Image { get; set; } = [];

    public decimal BasPrice { get; set; } = 0;

    public decimal PricesWithoutDiscounts { get; set; } = 0;

    public bool IsActive { get; set; } = true;
}