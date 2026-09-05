using kvk.Badminton.Features.CourtBookingTemporary;

namespace kvk.Saloon.Features.StaffSchedule;

public class SaloonStaffScheduleResponse
{
    public Guid Id { get; set; }
    public Guid SaloonStaffId { get; set; }
    public DaysOfWeek DayOfWeek { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
