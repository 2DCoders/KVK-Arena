using kvk.Badminton.Enums;

namespace kvk.Badminton.Features.Court;

public class CourtUpdateRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PricePerSlot { get; set; }
    public CourtStatus Status { get; set; }
}