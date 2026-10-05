using kvk.BuildingBlocks.Common;

namespace kvk.Saloon.Domain;

// Singleton settings row — applies to the whole salon (all seats, every day)
// until a per-seat/per-day SaloonSlotConfiguration is introduced in the UI.
public class SaloonBusinessHours : AuditableEntity
{
    public TimeSpan OpenTime { get; set; }

    public TimeSpan CloseTime { get; set; }

    public int SlotIntervalMinutes { get; set; }
}
