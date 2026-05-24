namespace kvk.BuildingBlocks.Interfaces;

using kvk.BuildingBlocks.Common;

/// <summary>
/// Generic contract for DayEnd services. Implementations may persist DayEnd records in module-specific schemas.
/// </summary>
public interface IDayEndService
{
    /// <summary>
    /// Persist a day-end record.
    /// </summary>
    Task<Result> CreateDayEndAsync(DayEnd dayEnd, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieve day-end records for a specific date (CurrentDate). If date is null, returns recent records.
    /// </summary>
    Task<List<DayEnd>> GetDayEndsAsync(DateTime? forDate = null, CancellationToken cancellationToken = default);
}


