namespace kvk.Saloon.Features.ServiceItem;

public class SaloonServiceItemUpdateRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    public int BufferMinutes { get; set; }
    public bool IsActive { get; set; }
}
