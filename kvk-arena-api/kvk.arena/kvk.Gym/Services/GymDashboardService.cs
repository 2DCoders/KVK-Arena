using kvk.Gym.Features.Dashboard;
using kvk.Gym.Features.Memberships;
using kvk.Gym.Features.MembershipPlans;
using kvk.Gym.Interfaces;

namespace kvk.Gym.Services;

public class GymDashboardService : IGymDashboardService
{
    private const string MemberPrefix = "GYM-MEM";
    private const string TrainerPrefix = "GYM-TRA";
    private const int RecentBlockedCount = 5;
    private const int MonthlyRevenueMonths = 6;

    private readonly IMembershipService _membershipService;
    private readonly IPaymentService _paymentService;
    private readonly IMembershipPlanService _membershipPlanService;

    public GymDashboardService(IMembershipService membershipService, IPaymentService paymentService,
        IMembershipPlanService membershipPlanService)
    {
        _membershipService = membershipService ?? throw new ArgumentNullException(nameof(membershipService));
        _paymentService = paymentService ?? throw new ArgumentNullException(nameof(paymentService));
        _membershipPlanService = membershipPlanService ?? throw new ArgumentNullException(nameof(membershipPlanService));
    }

    public async Task<GymDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default)
    {
        // includeDeleted: true also runs the auto-block-on-expiry pass internally, so Blocked
        // statuses are up to date before we aggregate.
        var allMembers = await _membershipService.GetAllMembersAsync(true, cancellationToken);

        var members = allMembers.Where(m => m.MembershipNumber.StartsWith(MemberPrefix)).ToList();
        var trainers = allMembers.Where(m => m.MembershipNumber.StartsWith(TrainerPrefix)).ToList();

        var activeMembers = members.Where(m => !m.IsDeleted).ToList();
        var activeTrainers = trainers.Where(t => !t.IsDeleted).ToList();

        var response = new GymDashboardResponse
        {
            TotalMembers = activeMembers.Count,
            TotalTrainers = activeTrainers.Count,

            ActiveCount = activeMembers.Count(IsActive) + activeTrainers.Count(IsActive),
            BlockedCount = activeMembers.Count(IsBlocked) + activeTrainers.Count(IsBlocked),

            RecentBlockedMembers = activeMembers
                .Where(IsBlocked)
                .OrderByDescending(m => m.LastModifiedAt)
                .Take(RecentBlockedCount)
                .Select(ToSummary)
                .ToList(),

            RecentBlockedTrainers = activeTrainers
                .Where(IsBlocked)
                .OrderByDescending(t => t.LastModifiedAt)
                .Take(RecentBlockedCount)
                .Select(ToSummary)
                .ToList(),

            DeletedMembers = members
                .Where(m => m.IsDeleted)
                .OrderByDescending(m => m.DeletedAt)
                .Select(ToSummary)
                .ToList(),

            DeletedTrainers = trainers
                .Where(t => t.IsDeleted)
                .OrderByDescending(t => t.DeletedAt)
                .Select(ToSummary)
                .ToList(),
        };

        var plansResult = await _membershipPlanService.GetAllAsync(cancellationToken);
        response.TotalMembershipPlans = plansResult.Succeeded &&
                                         plansResult.AdditionalData.TryGetValue("response", out var plansData) &&
                                         plansData is List<MembershipPlanResponse> plans
            ? plans.Count
            : 0;

        // The gym payment columns are "timestamp without time zone"; Npgsql rejects a Kind=Utc
        // value mixed with the Kind=Unspecified value PaymentService's own DateTime.Now default
        // would produce, so both bounds passed in here must be Unspecified too.
        var now = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Unspecified);
        var rangeStart = new DateTime(now.Year, now.Month, 1).AddMonths(-(MonthlyRevenueMonths - 1));
        var payments = await _paymentService.GetPaymentsByDateRangeAsync(rangeStart, now, cancellationToken);
        var paidPayments = payments.Where(p => p.PaymentStatus == kvk.Gym.Enums.PaymentStatus.Paid).ToList();

        response.TodaysRevenue = paidPayments
            .Where(p => p.CreatedAt.Date == now.Date)
            .Sum(p => p.Amount);

        for (var i = MonthlyRevenueMonths - 1; i >= 0; i--)
        {
            var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
            var monthRevenue = paidPayments
                .Where(p => p.CreatedAt.Year == monthStart.Year && p.CreatedAt.Month == monthStart.Month)
                .Sum(p => p.Amount);

            response.MonthlyRevenue.Add(new MonthlyRevenuePoint
            {
                Month = monthStart.ToString("MMM yyyy"),
                Revenue = monthRevenue
            });
        }

        return response;
    }

    private static bool IsActive(MembershipResponse member) =>
        string.Equals(member.MembershipStatus, "Active", StringComparison.OrdinalIgnoreCase);

    private static bool IsBlocked(MembershipResponse member) =>
        string.Equals(member.MembershipStatus, "Blocked", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(member.MembershipStatus, "Suspended", StringComparison.OrdinalIgnoreCase);

    private static GymDashboardPersonSummary ToSummary(MembershipResponse member) => new()
    {
        Id = member.Id,
        Name = $"{member.FirstName} {member.LastName}".Trim(),
        MembershipNumber = member.MembershipNumber,
        MembershipStatus = member.IsDeleted ? "Deleted" : member.MembershipStatus,
        IsDeleted = member.IsDeleted,
        DeletedAt = member.DeletedAt,
        MembershipPlanTitle = member.MembershipPlanTitle
    };
}
