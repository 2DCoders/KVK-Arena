using kvk.Gym.Domain;
using kvk.Gym.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using kvk.BuildingBlocks.Interfaces;

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
        var todayLocal = business.LocalMidnight;
        var previousLocal = ToLocalMidnight(business.LocalDate.AddDays(-1));
        var nextLocal = ToLocalMidnight(business.LocalDate.AddDays(1));

        var setting = new SystemSetting
        {
            Id = SystemSetting.SingletonId,
            PreviousDayEnd = previousLocal,
            CurrentDay = todayLocal,
            NextWorkingDay = nextLocal,
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
        var todayLocal = business.LocalMidnight;
        if (EnsureLocalKind(setting.CurrentDay) == todayLocal)
            return;

        var previousDayLocal = setting.CurrentDay == default
            ? ToLocalMidnight(business.LocalDate.AddDays(-1))
            : EnsureLocalKind(setting.CurrentDay);

        setting.PreviousDayEnd = previousDayLocal;
        setting.CurrentDay = todayLocal;

        // Resolve holiday service from the scope if available and compute next working day by skipping persisted holidays.
        var holidayService = scope.ServiceProvider.GetService<IHolidayService>();
        if (holidayService != null)
        {
            var next = await holidayService.GetNextWorkingDayAsync(business.LocalDate, cancellationToken);
            setting.NextWorkingDay = ToLocalMidnight(next);
        }
        else
        {
            setting.NextWorkingDay = ToLocalMidnight(business.LocalDate.AddDays(1));
        }

        await UpdateDayEndStatusAsync(db, setting, previousDayLocal, cancellationToken);

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

        var previousDayLocal = EnsureLocalKind(previousDay);
        var dayStartLocal = previousDayLocal.Date;
        var dayEndLocal = dayStartLocal.AddDays(1);

        var dayEndCompleted = await db.DayEnds
            .AsNoTracking()
            .AnyAsync(d => d.CurrentDate >= dayStartLocal && d.CurrentDate < dayEndLocal, cancellationToken);

        setting.LastDayEndCheckedDate = previousDayLocal;
        setting.IsDayEndCompleted = dayEndCompleted;

        if (!dayEndCompleted)
        {
            _logger.LogWarning(
                "Day-end record missing for {PreviousDay}",
                previousDayLocal.ToString("yyyy-MM-dd"));
        }
    }

    private (DateTime LocalDate, DateTime LocalMidnight) GetBusinessDateInfo()
    {
        var options = _options.Value;
        var timeZone = ResolveTimeZone(options.TimeZoneId);
        var nowInZone = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, timeZone);
        var localDate = nowInZone.Date;
        var localMidnight = ToLocalMidnight(localDate);
        return (localDate, localMidnight);
    }

    private static DateTime ToLocalMidnight(DateTime localDate)
    {
        return DateTime.SpecifyKind(localDate.Date, DateTimeKind.Unspecified);
    }

    private static DateTime EnsureLocalKind(DateTime value)
    {
        if (value.Kind == DateTimeKind.Unspecified)
            return value;

        return DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
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
