namespace kvk.Badminton.Features.CourtSlotConfiguration;

public class CourtSlotResponse
{
    public Guid Id { get; set; }
    public Guid CourtId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public bool IsActive { get; set; }
    public decimal Price { get; set; }
    public bool IsBooked { get; set; } // Added IsBooked property
    public DateTime CreatedAt { get; set; }
    public DateTime? LastModifiedAt { get; set; }
}