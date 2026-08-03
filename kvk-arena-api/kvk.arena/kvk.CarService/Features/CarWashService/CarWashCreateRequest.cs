using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace kvk.CarService.Features.CarWashService;

public class CarWashCreateRequest
{

    public required string Title { get; set; }
    
    public string? Description { get; set; }

    public decimal Price { get; set; } = 0;
    
    public IFormFile?  Image { get; set; } 
    
    public string? Features { get; set; }
}