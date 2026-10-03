using kvk.Badminton.Features.CourtBookingTemporary;
using kvk.BuildingBlocks.Common;

namespace kvk.Saloon.Domain;

public class SaloonSlotConfiguration : AuditableEntity
{

    public Guid SaloonId { get; set; }

    public DaysOfWeek DayOfWeek { get; set; }

    public TimeSpan StartTime { get; set; }

    public TimeSpan EndTime { get; set; }

    public int SlotIntervalMinutes { get; set; }

    public int MaxBookingsPerSlot { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual Saloon Saloon { get; set; } = null!;
}