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

public class SaloonDayAvailabilityRequest
{
    public DateOnly Date { get; set; }
    public List<Guid> SaloonServiceIds { get; set; } = new();
}

public class SaloonAvailableWindow
{
    /// <summary>Earliest time within this window a booking can start.</summary>
    public TimeSpan From { get; set; }

    /// <summary>Latest time within this window a booking can still start (and finish before closing).</summary>
    public TimeSpan To { get; set; }
}

public class SaloonDayAvailabilityResponse
{
    public bool IsAvailable { get; set; }
    public int TotalDurationMinutes { get; set; }
    public TimeSpan? NextAvailableStartTime { get; set; }
    public List<SaloonAvailableWindow> AvailableWindows { get; set; } = new();
    public string Message { get; set; } = string.Empty;
}
