namespace kvk.Saloon.Features.Saloon;

public class SaloonCreateRequest
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
