namespace kvk.Badminton.Features.Court;

public class CourtCreateRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal PricePerSlot { get; set; }
}