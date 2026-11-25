using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace kvk.Identity.Features.AdminSms;

internal static class SmsUsage
{
    internal const string LockSql = "SELECT pg_advisory_xact_lock(73040201)";

    internal static DateTime CurrentMonth(DateTime now)
    {
        var local = now.AddMinutes(330);
        return new DateTime(local.Year, local.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMinutes(-330);
    }

    private static DateTime EndOfMonth(DateTime month) => month.AddMinutes(330).AddMonths(1).AddMinutes(-330);

    internal static IQueryable<AdminSmsBatch> Batches(IdentityApplicationDbContext db, DateTime month)
    {
        var end = EndOfMonth(month);
        return db.AdminSmsBatches.Where(x => x.SubmittedUtc >= month && x.SubmittedUtc < end);
    }

    internal static IQueryable<SmsAttempt> SystemAttempts(IdentityApplicationDbContext db, DateTime month)
    {
        var end = EndOfMonth(month);
        // Admin sends already contribute through their batch, including batches before the SMS log existed.
        return db.SmsAttempts.Where(x => !x.AdminBatch && x.SubmittedUtc >= month && x.SubmittedUtc < end);
    }

    internal static async Task<int> AcceptedSegments(IdentityApplicationDbContext db, DateTime month, CancellationToken ct) =>
        await Batches(db, month).SumAsync(x => x.AcceptedSegments, ct)
        + await SystemAttempts(db, month).SumAsync(x => x.Segments ?? 0, ct);

    internal static int Excess(int used, int total, int limit) =>
        Math.Max(0, used + total - limit) - Math.Max(0, used - limit);
}
