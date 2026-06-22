namespace kvk.BuildingBlocks.Common;

/// <summary>
/// DTO representing end-of-day cash reconciliation information.
/// This is a shared DTO used by module-specific services (e.g. Gym) to persist and query DayEnd records.
/// </summary>
public class DayEnd
{
    // The date the report is for (typically the current business date)
    public DateTime CurrentDate { get; set; }

    // Expected total cash (after today's takings)
    public decimal ExpectedCashTotal { get; set; }

    // Actual counted cash at day end
    public decimal ActualCashCount { get; set; }

    // Discrepancy between expected and actual cash. Implementations may compute this server-side.
    public decimal Discrepancy { get; set; }

    // Remarks are required for auditing (e.g. explanation of discrepancy)
    public string? Remark { get; set; } = string.Empty;

    // Amount to hold for the next day (float to next day's float)
    public decimal HoldForNextDay { get; set; }
}