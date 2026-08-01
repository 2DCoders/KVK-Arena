using System.ComponentModel.DataAnnotations;
using kvk.CarService.Enums;

namespace kvk.CarService.Features.CarWashService;

public class CarWashServiceResponse
{
    public Guid Id { get; set; }

    public required string Title { get; set; }

    public int? DurationInMinutes { get; set; } = 0;
    
    public ServiceCategory  ServiceCategory { get; set; }
    
    public string? Description { get; set; }

    public decimal Price { get; set; } = 0;
    
    public byte[]  Image { get; set; } = [];
    
    public string? Features { get; set; }
    
}