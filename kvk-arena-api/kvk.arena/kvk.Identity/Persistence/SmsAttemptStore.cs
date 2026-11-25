using kvk.BuildingBlocks.Interfaces;
using kvk.Identity.Domain;
using kvk.Identity.Features.AdminSms;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace kvk.Identity.Persistence;

public class SmsAttemptStore(IServiceScopeFactory scopeFactory, IConfiguration configuration) : ISmsAttemptStore
{
    public async Task<Guid> StartAsync(string phoneNumber, bool adminBatch, CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityApplicationDbContext>();
        var attempt = new SmsAttempt
        {
            SubmittedUtc = DateTime.UtcNow, PhoneNumber = phoneNumber, AdminBatch = adminBatch,
            Status = SmsAttemptStatus.Pending
        };
        db.SmsAttempts.Add(attempt);
        await db.SaveChangesAsync(cancellationToken);
        return attempt.Id;
    }

    public async Task CompleteAsync(Guid id, SmsAttemptStatus status, int? segments, CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<IdentityApplicationDbContext>();
        await using var tx = await db.Database.BeginTransactionAsync(cancellationToken);
        var attempt = await db.SmsAttempts.SingleAsync(x => x.Id == id, cancellationToken);
        if (!attempt.AdminBatch && segments is int pages)
        {
            await db.Database.ExecuteSqlRawAsync(SmsUsage.LockSql, cancellationToken);
            var month = SmsUsage.CurrentMonth(attempt.SubmittedUtc);
            var previous = await SmsUsage.AcceptedSegments(db, month, cancellationToken);
            var limit = configuration.GetValue("AdminSms:MonthlyLimit", 0);
            var price = configuration.GetValue("AdminSms:Price", 0.59m);
            attempt.MaintenanceCharge = SmsUsage.Excess(previous, pages, limit) * price;
        }
        attempt.Status = status;
        attempt.Segments = segments;
        await db.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);
    }
}
