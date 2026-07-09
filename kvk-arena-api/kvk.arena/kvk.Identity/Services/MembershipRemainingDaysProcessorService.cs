using kvk.BuildingBlocks.Enums;
using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace kvk.Identity.Services;

public class MembershipRemainingDaysProcessorService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MembershipRemainingDaysProcessorService> _logger;
    private readonly IOptions<MembershipRemainingDaysProcessorOptions> _options;
    private readonly ISmsService _smsService;

    public MembershipRemainingDaysProcessorService(
        IServiceScopeFactory scopeFactory,
        ILogger<MembershipRemainingDaysProcessorService> logger,
        IOptions<MembershipRemainingDaysProcessorOptions> options, ISmsService smsService)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _options = options;
        _smsService = smsService;
    }


    public async Task RunAsync()
    {
        _logger.LogInformation("Starting membership remaining days processor job.");
        await UpdateMembersDurationDaysAsync(CancellationToken.None);
        _logger.LogInformation("Finished membership remaining days processor job.");
    }


    private async Task UpdateMembersDurationDaysAsync(CancellationToken cancellationToken)
    {
        await using var scope = _scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityApplicationDbContext>();

        var members = await db.KvkMembers
            .Where(m => m.MembershipStatus == MemberShipActiveStatus.Active && m.IsPaid == true)
            .ToListAsync(cancellationToken);

        foreach (var member in members)
        {
            if (member.MembershipDurationDays.HasValue && member.MembershipDurationDays > 0)
            {
                member.MembershipDurationDays -= 1;

                if (member.MembershipDurationDays <= 0)
                {
                    member.MembershipStatus = MemberShipActiveStatus.Inactive;
                    await _smsService.SendSingleMessageAsync(member.Phone!,
                        $"Dear {member.FirstName}, your membership has expired. Please renew to continue enjoying our services.",
                        cancellationToken);
                    _logger.LogInformation("Member {MemberId} membership expired and set to Inactive.",
                        member.MemberId);
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);
        _logger.LogInformation("Updated remaining days for {Count} active members.", members.Count);
    }
}

public class MembershipRemainingDaysProcessorOptions
{
    public const string SectionName = "Identity:KvkMember";

    public string? TimeZoneId { get; set; }

    public TimeSpan RunAt { get; set; } = TimeSpan.Zero;
}