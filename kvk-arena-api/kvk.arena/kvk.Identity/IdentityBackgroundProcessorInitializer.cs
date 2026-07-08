using Hangfire;
using kvk.BuildingBlocks.Enums;
using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Persistence;
using kvk.Identity.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;
using kvk.BuildingBlocks.Common; // For TimeZoneFormaterHangfire

namespace kvk.Identity;

public class IdentityBackgroundProcessorInitializer : IBackgroundProcessorInitializer
{
    public async Task InitializeAsync(IServiceProvider serviceProvider, ILogger logger)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;

        var dayEndOptions = services.GetRequiredService<IOptions<MembershipRemainingDaysProcessorOptions>>().Value;
        var dayEndTimeZone = TimeZoneFormaterHangfire.ResolveTimeZone(dayEndOptions.TimeZoneId);
        var runAt = dayEndOptions.RunAt;
        var dailyCron = Cron.Daily(runAt.Hours, runAt.Minutes);

        var identityDb = services.GetRequiredService<IdentityApplicationDbContext>();
        // Check if there are active members whose status might need updating for the new day
        var hasActiveMembers = await identityDb.KvkMembers
            .AnyAsync(m => m.MembershipStatus == MemberShipActiveStatus.Active);

        if (hasActiveMembers)
        {
            BackgroundJob.Enqueue<MembershipRemainingDaysProcessorService>(job => job.RunAsync());
            logger.LogInformation("Membership remaining days processor queued for catch-up.");
        }

        RecurringJob.AddOrUpdate<MembershipRemainingDaysProcessorService>(
            "Identity.MembershipRemainingDaysProcessor",
            job => job.RunAsync(),
            dailyCron,
            new RecurringJobOptions { TimeZone = dayEndTimeZone });

        logger.LogInformation("Identity background processors initialized.");
    }
}
