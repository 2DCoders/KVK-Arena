using Hangfire;
using kvk.BuildingBlocks.Interfaces;
using kvk.Gym.Domain;
using kvk.Gym.Options;
using kvk.Gym.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;
using kvk.BuildingBlocks.Common; // For TimeZoneFormaterHangfire

namespace kvk.Gym;

public class GymBackgroundProcessorInitializer : IBackgroundProcessorInitializer
{
    public async Task InitializeAsync(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;

        var dayEndOptions = services.GetRequiredService<IOptions<GymDayEndOptions>>().Value;
        var dayEndTimeZone = TimeZoneFormaterHangfire.ResolveTimeZone(dayEndOptions.TimeZoneId);
        var runAt = dayEndOptions.RunAt;
        var dailyCron = Cron.Daily(runAt.Hours, runAt.Minutes);

        var db = services.GetRequiredService<GymDbContext>();
        var currentSetting = await db.SystemSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == SystemSetting.SingletonId);

        var businessDate = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, dayEndTimeZone).Date;

        if (currentSetting == null || currentSetting.CurrentDay.Date < businessDate)
        {
            BackgroundJob.Enqueue<SystemSettingRolloverService>(job => job.RunAsync());
            logger.LogInformation("System setting rollover queued for catch-up.");
        }

        RecurringJob.AddOrUpdate<SystemSettingRolloverService>(
            "Gym.SystemSettingRollover",
            job => job.RunAsync(),
            dailyCron,
            new RecurringJobOptions { TimeZone = dayEndTimeZone });

        logger.LogInformation("Gym background processors initialized.");
    }
}
