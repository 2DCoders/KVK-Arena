namespace kvk.Badminton.Features.CourtBookingTemporary;

public class CourtBookingTemporaryAvailabilityCheckResponse
{
    public bool IsAvailable { get; set; }

    public int DurationInWeeks { get; set; }

    public decimal OriginalAmount { get; set; }

    public decimal DiscountAmount { get; set; }

    public decimal FinalAmount { get; set; }

    public List<UnavailableScheduleResponse> UnavailableSchedules { get; set; }
        = new();
}

public class UnavailableScheduleResponse
{
    public DaysOfWeek DayOfWeek { get; set; }

    public Guid SlotId { get; set; }

    public string SlotName { get; set; }

    public string Message { get; set; }
}