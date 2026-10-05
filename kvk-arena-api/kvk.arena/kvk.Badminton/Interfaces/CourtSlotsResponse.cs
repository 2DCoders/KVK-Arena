namespace kvk.Badminton.Interfaces;

public class CourtSlotsResponse
{
    
    public Guid CourtId { get; set; }

    public Guid SlotId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public decimal Price { get; set; }
}