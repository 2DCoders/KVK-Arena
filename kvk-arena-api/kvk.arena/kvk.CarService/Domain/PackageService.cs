namespace kvk.CarService.Domain;

public class PackageService
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid PackageId { get; set; }

    public Package Package { get; set; } = null!;

    public Guid ServiceId { get; set; }

    public CarService Service { get; set; } = null!;
    
    public Guid TenantId { get; set; } = Guid.Parse("00000000-0000-0000-0000-000000000001");
}