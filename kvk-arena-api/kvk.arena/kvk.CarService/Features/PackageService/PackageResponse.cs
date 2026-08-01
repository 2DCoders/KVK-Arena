using kvk.CarService.Features.CarWashService;

namespace kvk.CarService.Features.PackageService;

public class PackageResponse
{
    public Guid Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public int? DurationInMinutes { get; set; } = 0;

    public byte[]? Image { get; set; } = [];

    public decimal BasPrice { get; set; } = 0;

    public decimal PricesWithoutDiscounts { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public List<CarWashServiceResponse> Services { get; set; } = [];
}
