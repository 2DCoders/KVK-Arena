using kvk.Badminton.Features.CourtBookingTemporary;

namespace kvk.Saloon.Features.StaffSchedule;

public class SaloonStaffScheduleCreateRequest
{
    public Guid SaloonStaffId { get; set; }
    public DaysOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; } = true;
}
