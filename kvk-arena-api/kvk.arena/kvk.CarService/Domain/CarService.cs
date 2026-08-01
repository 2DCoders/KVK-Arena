using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
using kvk.CarService.Enums;

namespace kvk.CarService.Domain;

public class CarService : AuditableEntity
{
    [MaxLength(10)]
    public required string Title { get; set; }

    public int? DurationInMinutes { get; set; } = 0;
    
    public ServiceCategory  ServiceCategory { get; set; }
    
    [MaxLength(250)]
    public string? Description { get; set; }

    public decimal Price { get; set; } = 0;
    
    public byte[]  Image { get; set; } = [];
    
    [MaxLength(250)]
    public string? Features { get; set; }


}