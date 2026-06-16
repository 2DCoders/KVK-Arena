namespace kvk.BuildingBlocks.Interfaces;

public interface IHolidayService
{
    Task<List<Common.CalenderHolidays>> GetHolidaysAsync(int year, CancellationToken cancellationToken = default);

    /// <summary>
    /// Import holidays for a given year from configured ICS feed. Throws InvalidOperationException if year already imported.
    /// </summary>
    Task ImportIcsForYearAsync(int year, CancellationToken cancellationToken = default);

    Task<Common.CalenderHolidays> CreateAsync(Common.CalenderHolidays holiday, CancellationToken cancellationToken = default);

    Task UpdateAsync(Guid id, Common.CalenderHolidays holiday, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the next working day after startExclusive by skipping persisted holidays. Weekends are considered working days.
    /// The returned DateTime should be DateKind Unspecified local-midnight.
    /// </summary>
    Task<DateTime> GetNextWorkingDayAsync(DateTime startExclusive, CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns a list of the next N working days (excluding weekends and holidays).
    /// </summary>
    Task<List<DateTime>> GetNextWorkingDaysAsync(DateTime startDate, int count, CancellationToken cancellationToken = default);
}


