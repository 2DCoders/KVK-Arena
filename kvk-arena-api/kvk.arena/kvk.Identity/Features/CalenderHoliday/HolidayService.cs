using System.Text.RegularExpressions;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace kvk.Identity.Features.CalenderHoliday;

public class HolidayService : IHolidayService
{
    private readonly IdentityApplicationDbContext _db;
    private readonly IHttpClientFactory _httpFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<HolidayService> _logger;

    private const string DefaultIcsUrl = "https://www.officeholidays.com/ics-clean/sri-lanka";

    public HolidayService(
        IdentityApplicationDbContext db,
        IHttpClientFactory httpFactory,
        IConfiguration configuration,
        ILogger<HolidayService> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _httpFactory = httpFactory ?? throw new ArgumentNullException(nameof(httpFactory));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<List<CalenderHolidays>> GetHolidaysAsync(int year, CancellationToken cancellationToken = default)
    {
        var yearStr = year.ToString();
        return await _db.CalenderHolidays
            .AsNoTracking()
            .Where(h => h.Year == yearStr && h.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task ImportIcsForYearAsync(int year, CancellationToken cancellationToken = default)
    {
        var yearStr = year.ToString();
        var already = await _db.CalenderHolidays.AnyAsync(h => h.IsImported && h.Year == yearStr, cancellationToken);
        if (already)
            throw new InvalidOperationException($"Holidays for {year} already imported.");

        var icsUrl = _configuration.GetValue<string>("Calendar:ImportedIcsUrl") ?? DefaultIcsUrl;
        var client = _httpFactory.CreateClient();
        string content;
        try
        {
            content = await client.GetStringAsync(icsUrl, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch ICS from {Url}", icsUrl);
            throw;
        }

        var events = ParseIcsEvents(content);

        var toInsert = new List<CalenderHolidays>();

        foreach (var ev in events)
        {
            if (ev.Start.Year != year)
                continue;

            var start = ev.Start.Date;
            var end = ev.End.HasValue ? ev.End.Value.Date : start.AddDays(1);
            var durationDays = Math.Max(1, (end - start).Days);

            var entry = new CalenderHolidays
            {
                Year = start.Year.ToString(),
                Month = start.Month.ToString("D2"),
                Day = start.Day.ToString("D2"),
                Description = ev.Summary ?? string.Empty,
                IsActive = true,
                IsImported = true,
                Source = icsUrl
            };

            // If multi-day, insert additional entries for subsequent days
            for (int i = 0; i < durationDays; i++)
            {
                var d = start.AddDays(i);
                var multi = new CalenderHolidays
                {
                    Year = d.Year.ToString(),
                    Month = d.Month.ToString("D2"),
                    Day = d.Day.ToString("D2"),
                    Description = entry.Description,
                    IsActive = true,
                    IsImported = true,
                    Source = entry.Source
                };
                toInsert.Add(multi);
            }
        }

        if (toInsert.Count == 0)
            return;

        // Avoid duplicates: only add entries for dates that do not exist yet
        foreach (var item in toInsert)
        {
            var exists = await _db.CalenderHolidays.AnyAsync(h => h.Year == item.Year && h.Month == item.Month && h.Day == item.Day, cancellationToken);
            if (!exists)
                _db.CalenderHolidays.Add(item);
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<CalenderHolidays> CreateAsync(CalenderHolidays holiday, CancellationToken cancellationToken = default)
    {
        _db.CalenderHolidays.Add(holiday);
        await _db.SaveChangesAsync(cancellationToken);
        return holiday;
    }

    public async Task UpdateAsync(Guid id, CalenderHolidays holiday, CancellationToken cancellationToken = default)
    {
        var existing = await _db.CalenderHolidays.FindAsync(new object[] { id }, cancellationToken);
        if (existing == null)
            throw new KeyNotFoundException("Holiday not found");

        existing.Year = holiday.Year;
        existing.Month = holiday.Month;
        existing.Day = holiday.Day;
        existing.Description = holiday.Description;
        existing.IsActive = holiday.IsActive;
        existing.IsImported = holiday.IsImported;
        existing.Source = holiday.Source;
        // Duration, HolidayType and DayOfWeek properties were removed from CalenderHolidays; keep other fields updated.

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var existing = await _db.CalenderHolidays.FindAsync(new object[] { id }, cancellationToken);
        if (existing == null)
            return;

        _db.CalenderHolidays.Remove(existing);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<DateTime> GetNextWorkingDayAsync(DateTime startExclusive, CancellationToken cancellationToken = default)
    {
        // startExclusive: treat as local date; we return DateKind Unspecified midnight
        var candidate = DateTime.SpecifyKind(startExclusive.Date.AddDays(1), DateTimeKind.Unspecified);

        while (true)
        {
            var year = candidate.Year.ToString();
            var month = candidate.Month.ToString("D2");
            var day = candidate.Day.ToString("D2");

            var exists = await _db.CalenderHolidays
                .AsNoTracking()
                .AnyAsync(h => h.Year == year && h.Month == month && h.Day == day && h.IsActive, cancellationToken);

            if (!exists)
                return DateTime.SpecifyKind(candidate.Date, DateTimeKind.Unspecified);

            candidate = DateTime.SpecifyKind(candidate.AddDays(1).Date, DateTimeKind.Unspecified);
        }
    }

    // DayOfWeek mapping removed — CalenderHolidays DayOfWeek can be set manually if needed.

    private record IcsEvent(DateTime Start, DateTime? End, string? Summary);

    private static List<IcsEvent> ParseIcsEvents(string icsContent)
    {
        var list = new List<IcsEvent>();
        if (string.IsNullOrWhiteSpace(icsContent))
            return list;

        // Split VEVENT blocks
        var blocks = Regex.Split(icsContent, "BEGIN:VEVENT", RegexOptions.IgnoreCase);
        foreach (var block in blocks.Skip(1))
        {
            // Unfold folded lines (lines in ICS that continue on the next line start with a space or tab)
            var unfolded = Regex.Replace(block, "\r\n[ \t]", "");

            var endMatch = Regex.Match(unfolded, "DTEND(?::|;[^:]*:)?(?<dt>\\d{8}(T\\d{6}Z?)?)", RegexOptions.IgnoreCase);
            var dtstartMatch = Regex.Match(unfolded, "DTSTART(?::|;[^:]*:)?(?<dt>\\d{8}(T\\d{6}Z?)?)", RegexOptions.IgnoreCase);

            // SUMMARY may include parameters like "SUMMARY;LANGUAGE=en-us:Deepavali Festival Day"
            // Match SUMMARY with optional ;params before the ':' and capture up to end of line
            var summaryMatch = Regex.Match(unfolded, "SUMMARY(?::|;[^:]*:)?(?<s>[^\\r\\n]*)", RegexOptions.IgnoreCase);

            if (!dtstartMatch.Success)
                continue;

            var dtstart = ParseIcsDate(dtstartMatch.Groups["dt"].Value);
            DateTime? dtend = null;
            if (endMatch.Success)
                dtend = ParseIcsDate(endMatch.Groups["dt"].Value);

            var summary = summaryMatch.Success ? summaryMatch.Groups["s"].Value.Trim() : null;

            list.Add(new IcsEvent(dtstart, dtend, summary));
        }

        return list;
    }

    private static DateTime ParseIcsDate(string raw)
    {
        // Supports YYYYMMDD and YYYYMMDDTHHMMSSZ
        if (raw.Contains("T"))
        {
            // Try parse as UTC or local
            if (DateTime.TryParseExact(raw, "yyyyMMdd'T'HHmmss'Z'", null, System.Globalization.DateTimeStyles.AssumeUniversal, out var dtz))
                return dtz.ToLocalTime();

            if (DateTime.TryParseExact(raw, "yyyyMMdd'T'HHmmss", null, System.Globalization.DateTimeStyles.AssumeLocal, out var dt))
                return dt;
        }

        if (DateTime.TryParseExact(raw, "yyyyMMdd", null, System.Globalization.DateTimeStyles.None, out var d))
            return d.Date;

        // Fallback
        return DateTime.Parse(raw);
    }
}

