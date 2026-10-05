namespace kvk.Saloon.Features.BusinessHours;

public class SaloonBusinessHoursUpdateRequest
{
    public TimeSpan OpenTime { get; set; }

    public TimeSpan CloseTime { get; set; }

    public int SlotIntervalMinutes { get; set; }
}
