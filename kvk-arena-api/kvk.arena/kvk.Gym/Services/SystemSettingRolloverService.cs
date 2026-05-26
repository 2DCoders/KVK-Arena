using kvk.Gym.Domain;
using kvk.Gym.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace kvk.Gym.Services;

public class SystemSettingRolloverService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SystemSettingRolloverService> _logger;
    private readonly IOptions<GymDayEndOptions> _options;

    public SystemSettingRolloverService(
        IServiceScopeFactory scopeFactory,
        ILogger<SystemSettingRolloverService> logger,
        IOptions<GymDayEndOptions> options)
    {
        _scopeFactory = scopeFactory ?? throw new ArgumentNullException(nameof(scopeFactory));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _options = options ?? throw new ArgumentNullException(nameof(options));
    }

    public async Task RunAsync()
    {
        await EnsureSystemSettingExistsAsync(CancellationToken.None);
        await EnsureCurrentDayAsync(CancellationToken.None);
    }

    private async Task EnsureSystemSettingExistsAsync(CancellationToken cancellationToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<GymDbContext>();

        var exists = await db.SystemSettings
            .AsNoTracking()
            .AnyAsync(s => s.Id == SystemSetting.SingletonId, cancellationToken);

        if (exists)
            return;

        var business = GetBusinessDateInfo();
        var todayUtc = business.UtcMidnight;
        var previousUtc = ToUtcMidnight(business.LocalDate.AddDays(-1), business.TimeZone);
        var nextUtc = ToUtcMidnight(business.LocalDate.AddDays(1), business.TimeZone);

        var setting = new SystemSetting
        {
            Id = SystemSetting.SingletonId,
            PreviousDayEnd = previousUtc,
            CurrentDay = todayUtc,
            NextWorkingDay = nextUtc,
            LastDayEndCheckedDate = null,
            IsDayEndCompleted = false
        };

        db.SystemSettings.Add(setting);
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureCurrentDayAsync(CancellationToken cancellationToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<GymDbContext>();

        var setting = await db.SystemSettings
            .FirstOrDefaultAsync(s => s.Id == SystemSetting.SingletonId, cancellationToken);

        if (setting == null)
            return;

        var business = GetBusinessDateInfo();
        var todayUtc = business.UtcMidnight;
        if (EnsureUtcKind(setting.CurrentDay) == todayUtc)
            return;

        var previousDayUtc = setting.CurrentDay == default
            ? ToUtcMidnight(business.LocalDate.AddDays(-1), business.TimeZone)
            : EnsureUtcKind(setting.CurrentDay);

        setting.PreviousDayEnd = previousDayUtc;
        setting.CurrentDay = todayUtc;
        setting.NextWorkingDay = ToUtcMidnight(business.LocalDate.AddDays(1), business.TimeZone);

        await UpdateDayEndStatusAsync(db, setting, previousDayUtc, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task UpdateDayEndStatusAsync(
        GymDbContext db,
        SystemSetting setting,
        DateTime previousDay,
        CancellationToken cancellationToken)
    {
        if (previousDay == default)
            return;

        var previousDayUtc = EnsureUtcKind(previousDay);
        var dayStartUtc = previousDayUtc.Date;
        var dayEndUtc = dayStartUtc.AddDays(1);

        var dayEndCompleted = await db.DayEnds
            .AsNoTracking()
            .AnyAsync(d => d.CurrentDate >= dayStartUtc && d.CurrentDate < dayEndUtc, cancellationToken);

        setting.LastDayEndCheckedDate = previousDayUtc;
        setting.IsDayEndCompleted = dayEndCompleted;

        if (!dayEndCompleted)
        {
            _logger.LogWarning(
                "Day-end record missing for {PreviousDay}",
                previousDayUtc.ToString("yyyy-MM-dd"));
        }
    }

    private (DateTime LocalDate, DateTime UtcMidnight, TimeZoneInfo TimeZone) GetBusinessDateInfo()
    {
        var options = _options.Value;
        var timeZone = ResolveTimeZone(options.TimeZoneId);
        var nowInZone = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, timeZone);
        var localDate = nowInZone.Date;
        var utcMidnight = ToUtcMidnight(localDate, timeZone);
        return (localDate, utcMidnight, timeZone);
    }

    private static DateTime ToUtcMidnight(DateTime localDate, TimeZoneInfo timeZone)
    {
        var localMidnight = DateTime.SpecifyKind(localDate.Date, DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(localMidnight, timeZone);
    }

    private static DateTime EnsureUtcKind(DateTime value)
    {
        if (value.Kind == DateTimeKind.Utc)
            return value;

        if (value.Kind == DateTimeKind.Unspecified)
            return DateTime.SpecifyKind(value, DateTimeKind.Utc);

        return value.ToUniversalTime();
    }

    private TimeZoneInfo ResolveTimeZone(string? timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId))
            return TimeZoneInfo.Local;

        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (TimeZoneNotFoundException)
        {
            _logger.LogWarning("Time zone '{TimeZoneId}' not found. Falling back to local time.", timeZoneId);
            return TimeZoneInfo.Local;
        }
        catch (InvalidTimeZoneException)
        {
            _logger.LogWarning("Time zone '{TimeZoneId}' invalid. Falling back to local time.", timeZoneId);
            return TimeZoneInfo.Local;
        }
    }
}
