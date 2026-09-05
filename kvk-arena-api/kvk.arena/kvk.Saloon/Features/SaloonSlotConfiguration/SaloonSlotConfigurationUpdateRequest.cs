using kvk.Badminton.Features.CourtBookingTemporary;

namespace kvk.Saloon.Features.SaloonSlotConfiguration;

public class SaloonSlotConfigurationUpdateRequest
{
    public Guid Id { get; set; }
    public DaysOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int SlotIntervalMinutes { get; set; }
    public int MaxBookingsPerSlot { get; set; }
    public bool IsActive { get; set; }
}