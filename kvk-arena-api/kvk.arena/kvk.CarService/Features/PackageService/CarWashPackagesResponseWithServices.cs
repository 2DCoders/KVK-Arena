using kvk.CarService.Enums;

namespace kvk.CarService.Features.PackageService;

public class CarWashPackagesResponseWithServices
{
    public Guid Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public int? DurationInMinutes { get; set; } = 0;

    public decimal BasPrice { get; set; } = 0;

    public decimal PricesWithoutDiscounts { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public List<ServiceResponseWithoutImage>? Services { get; set; }
}

public class ServiceResponseWithoutImage
{
    public Guid Id { get; set; }

    public required string Title { get; set; }

    public int? DurationInMinutes { get; set; } = 0;

    public ServiceCategory ServiceCategory { get; set; }

    public string? Description { get; set; }

    public decimal Price { get; set; } = 0;

    public string? Features { get; set; }
}