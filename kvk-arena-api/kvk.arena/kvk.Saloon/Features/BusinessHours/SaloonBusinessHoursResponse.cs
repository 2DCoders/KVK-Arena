namespace kvk.Saloon.Features.BusinessHours;

public class SaloonBusinessHoursResponse
{
    public Guid Id { get; set; }

    public TimeSpan OpenTime { get; set; }

    public TimeSpan CloseTime { get; set; }

    public int SlotIntervalMinutes { get; set; }

    public DateTime LastModifiedAt { get; set; }
}
