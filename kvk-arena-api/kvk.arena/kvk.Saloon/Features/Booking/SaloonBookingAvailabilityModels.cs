namespace kvk.Saloon.Features.Booking;

public class SaloonBookingAvailabilityRequest
{
    public DateOnly Date { get; set; }
    public TimeSpan Time { get; set; }
    public List<Guid> SaloonServiceIds { get; set; } = new();
}

public class SaloonBookingAvailabilityResponse
{
    public bool IsAvailable { get; set; }
    public TimeSpan? AvailableStartTime { get; set; }
    public TimeSpan? AvailableEndTime { get; set; }
    public Guid? AssignedSaloonId { get; set; }
    public List<TimeSpan> SuggestedAlternativeTimes { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}
