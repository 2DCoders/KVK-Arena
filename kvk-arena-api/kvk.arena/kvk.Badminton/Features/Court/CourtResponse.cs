using kvk.Badminton.Enums;

namespace kvk.Badminton.Features.Court;

public class CourtResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public CourtStatus Status { get; set; }
    public decimal PricePerSlot { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}