using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace kvk.CarService.Features.PackageService;

public class PackageCreateRequest
{
    [MaxLength(100)]
    public required string Title { get; set; }

    public string? Description { get; set; }

    public IFormFile? Image { get; set; }

    public decimal BasPrice { get; set; } = 0;

    public decimal PricesWithoutDiscounts { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public List<Guid> ServiceIds { get; set; } = [];
}
