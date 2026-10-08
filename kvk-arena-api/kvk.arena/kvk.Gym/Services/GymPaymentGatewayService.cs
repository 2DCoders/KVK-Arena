using System.Data;
using System.Globalization;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Enums;
using kvk.BuildingBlocks.Services;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using kvk.Gym.Features.PaymentGateway;
using kvk.Gym.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace kvk.Gym.Services;

public class GymPaymentGatewayService(GymDbContext db, IHashService hashService,
    IOptions<PayHereOptions> payHereOptions, ILogger<GymPaymentGatewayService> logger) : IGymPaymentGatewayService
{
    private readonly PayHereOptions _options = payHereOptions.Value;

    public async Task<PaymentGatewayResponse> ProcessPayment(PaymentGatewayRequest request)
    {
        var member = await db.Memberships.SingleOrDefaultAsync(m => m.Id == request.MemberId && !m.IsDeleted)
            ?? throw new ArgumentException("Member not found");
        var plan = await db.MembershipPlans.SingleOrDefaultAsync(p => p.Id == request.MembershipPlanId)
            ?? throw new ArgumentException("Membership plan not found");
        if (plan.IsActive != ActiveStatus.Active || plan.Title.Trim().Equals("Day Pass", StringComparison.OrdinalIgnoreCase))
            throw new ArgumentException("This membership plan is not available for online payment");
        if (plan.Price <= 0 || plan.DurationInDays <= 0 || request.Amount != plan.Price)
            throw new ArgumentException("Payment amount must match the selected membership plan price");

        var orderId = $"ORD-{Guid.NewGuid():N}";
        // Checkout must not change the paid membership. Snapshot the requested plan on its order.
        db.PaymentRecords.Add(new PaymentRecord
        {
            Amount = plan.Price, PaymentStatus = PaymentStatus.Pending,
            MembershipId = member.Id, PaymentType = PaymentType.DebitCard,
            TransactionReference = orderId, MembershipNumber = member.MembershipNumber,
            MembershipPlanId = plan.Id, MembershipPlanTitle = plan.Title
        });
        await db.SaveChangesAsync();
        return new PaymentGatewayResponse
        {
            MerchantId = _options.MerchantId, OrderId = orderId, Currency = _options.Currency,
            Amount = plan.Price.ToString("0.00", CultureInfo.InvariantCulture),
            Hash = hashService.GeneratePayHereHash(_options.MerchantId, _options.MerchantSecret,
                orderId, plan.Price, _options.Currency),
            Sandbox = _options.Sandbox
        };
    }

    public async Task<PaymentGatewayStatusResponse?> GetPaymentStatus(string orderId, Guid memberId,
        CancellationToken cancellationToken = default) => await db.PaymentRecords.AsNoTracking()
        .Where(p => p.TransactionReference == orderId && p.MembershipId == memberId)
        .Select(p => new PaymentGatewayStatusResponse
        {
            OrderId = orderId, PaymentStatus = p.PaymentStatus,
            StartDate = p.MemberShipStartDate, EndDate = p.MemberShipEndDate
        }).SingleOrDefaultAsync(cancellationToken);

    public async Task<Result> DeletePendingPayment(PendingPaymentDeleteRequest request,
        CancellationToken cancellationToken = default)
    {
        await using var transaction = db.Database.CurrentTransaction == null
            ? await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken) : null;
        var record = await db.PaymentRecords.SingleOrDefaultAsync(p =>
            p.TransactionReference == request.OrderId && p.MembershipId == request.MemberId, cancellationToken);
        if (record == null) return Result.Failure("Payment order not found");
        if (record.PaymentStatus == PaymentStatus.Paid)
            return Result.Success("Payment is already verified; it has not been cancelled");
        // Retain cancelled orders for late signed notifications; dismissal does not prove no charge occurred.
        record.PaymentStatus = PaymentStatus.Cancelled;
        await db.SaveChangesAsync(cancellationToken);
        if (transaction != null) await transaction.CommitAsync(cancellationToken);
        return Result.Success("Checkout cancelled; payment verification history retained");
    }

    public async Task VerifyPayment(PaymentNotificationRequest request)
    {
        if (request.MerchantId != _options.MerchantId || request.PayhereCurrency != _options.Currency
            || string.IsNullOrWhiteSpace(request.PaymentId)
            || !string.Equals(hashService.GenerateNotificationMd5Sig(request.MerchantId, _options.MerchantSecret,
                request.OrderId, request.PayhereAmount, request.PayhereCurrency, request.StatusCode),
                request.Md5Sig, StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Rejected invalid gym payment notification for {OrderId}", request.OrderId);
            return;
        }
        // Concurrent/repeated callbacks must not extend membership twice.
        await using var transaction = db.Database.CurrentTransaction == null
            ? await db.Database.BeginTransactionAsync(IsolationLevel.Serializable) : null;
        var record = await db.PaymentRecords.SingleOrDefaultAsync(p => p.TransactionReference == request.OrderId);
        if (record == null || record.Amount != request.PayhereAmount || record.PaymentStatus == PaymentStatus.Paid) return;
        if (request.StatusCode is -1 or -2 or -3)
        {
            record.PaymentStatus = PaymentStatus.Cancelled;
            await db.SaveChangesAsync();
            if (transaction != null) await transaction.CommitAsync();
            return;
        }
        if (request.StatusCode != 2) return;

        var member = await db.Memberships.SingleOrDefaultAsync(m => m.Id == record.MembershipId && !m.IsDeleted)
            ?? throw new InvalidOperationException("Payment membership not found");
        // Older pending orders did not snapshot the purchased plan.
        var plan = await db.MembershipPlans.SingleOrDefaultAsync(p => p.Id == (record.MembershipPlanId ?? member.MembershipPlanId))
            ?? throw new InvalidOperationException("Purchased membership plan not found");
        if (plan.DurationInDays <= 0) throw new InvalidOperationException("Invalid membership plan duration");

        var now = DateTime.UtcNow;
        var previousEnd = await db.MemberPayments.Where(p => p.MembershipId == member.Id && p.PaymentStatus == PaymentStatus.Paid)
            .MaxAsync(p => p.MemberShipEndDate);
        var start = member.MembershipStatus != MembershipStatus.Blocked && previousEnd > now ? previousEnd.Value : now;
        var end = start.AddDays(plan.DurationInDays);
        var payment = await db.MemberPayments.Where(p => p.MembershipId == member.Id)
            .OrderByDescending(p => p.CreatedAt).FirstOrDefaultAsync();
        if (payment == null)
        {
            payment = new MemberPayment { MembershipId = member.Id };
            db.MemberPayments.Add(payment);
        }
        payment.Amount = record.Amount;
        payment.PaymentType = record.PaymentType;
        payment.PaymentStatus = PaymentStatus.Paid;
        payment.TransactionReference = request.PaymentId;
        payment.MemberShipStartDate = start;
        payment.MemberShipEndDate = end;
        payment.MemberShipRenewalDate = now;
        member.MembershipPlanId = plan.Id;
        member.MembershipPlanPendingId = null;
        if (member.MembershipStatus == MembershipStatus.Blocked)
            member.MembershipStatus = !string.IsNullOrWhiteSpace(member.DeviceFingerprintId1)
                || !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2) ? MembershipStatus.Active : MembershipStatus.Inactive;

        record.PaymentStatus = PaymentStatus.Paid;
        record.MemberPaymentId = payment.Id;
        record.MemberShipStartDate = start;
        record.MemberShipEndDate = end;
        record.MemberShipRenewalDate = now;
        record.MembershipNumber = member.MembershipNumber;
        record.MembershipPlanId = plan.Id;
        record.MembershipPlanTitle ??= plan.Title;
        // Preserve the order reference for callback retries and browser status checks.
        await db.SaveChangesAsync();
        if (transaction != null) await transaction.CommitAsync();
        logger.LogInformation("Verified gym payment {OrderId}; membership renewed until {EndDate}", request.OrderId, end);
    }
}
