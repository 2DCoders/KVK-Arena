using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Constants;
using kvk.BuildingBlocks.Interfaces;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using Microsoft.EntityFrameworkCore;
using kvk.Gym.Features.Payments;

namespace kvk.Gym.Services;

public class PaymentService : IPaymentService
{
    private readonly GymDbContext _db;
    private readonly ISmsService _smsService;

    public PaymentService(GymDbContext db, ISmsService smsService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _smsService = smsService;
    }

    public async Task<Result> CreatePaymentAsync(Guid memberId, CreatePaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships.SingleOrDefaultAsync(m => m.Id == memberId, cancellationToken);
            if (member == null)
                return Result.Failure("Member not found");

            var memberPayment = await _db.MemberPayments
                .Where(p => p.MembershipId == memberId)
                .FirstOrDefaultAsync(cancellationToken);

            if (memberPayment == null)
            {
                var payment = new MemberPayment
                {
                    MembershipId = member.Id,
                    Amount = request.Amount,
                    PaymentType = request.PaymentType,
                    PaymentStatus = request.PaymentStatus,
                    MemberShipStartDate = request.StartDate,
                    MemberShipEndDate = request.EndDate,
                    TransactionReference = request.TransactionReference
                };

                _db.MemberPayments.Add(payment);
                // create an immutable payment record for analytics/audit
                var record = new PaymentRecord
                {
                    MembershipId = member.Id,
                    MemberPaymentId = null,
                    Amount = request.Amount,
                    PaymentType = request.PaymentType,
                    PaymentStatus = request.PaymentStatus,
                    MemberShipStartDate = request.StartDate,
                    MemberShipEndDate = request.EndDate,
                    TransactionReference = request.TransactionReference,
                    MembershipNumber = member.MembershipNumber,
                    MembershipPlanId = member.MembershipPlanId,
                    MembershipPlanTitle = member.MembershipPlan?.Title
                };

                _db.PaymentRecords.Add(record);
            }
            else
            {
                var membershipPlan =
                    await _db.MembershipPlans.FirstOrDefaultAsync(mp => mp.Id == member.MembershipPlanId,
                        cancellationToken);

                if (request.StartDate == null)
                {
                    memberPayment.MemberShipStartDate = memberPayment.MemberShipEndDate;
                    memberPayment.MemberShipEndDate =
                        memberPayment.MemberShipStartDate?.AddDays(membershipPlan?.DurationInDays ?? 30);
                    memberPayment.MemberShipRenewalDate = DateTime.UtcNow;
                }

                memberPayment.PaymentType = request.PaymentType;
                memberPayment.PaymentStatus = PaymentStatus.Paid;
                memberPayment.TransactionReference = request.TransactionReference;

                _db.MemberPayments.Update(memberPayment);

                // record the payment action in the immutable PaymentRecords table
                var record = new PaymentRecord
                {
                    MembershipId = member.Id,
                    MemberPaymentId = memberPayment.Id,
                    Amount = request.Amount,
                    PaymentType = request.PaymentType,
                    PaymentStatus = PaymentStatus.Paid,
                    MemberShipStartDate = memberPayment.MemberShipStartDate,
                    MemberShipEndDate = memberPayment.MemberShipEndDate,
                    MemberShipRenewalDate = memberPayment.MemberShipRenewalDate,
                    TransactionReference = request.TransactionReference,
                    MembershipNumber = member.MembershipNumber,
                    MembershipPlanId = member.MembershipPlanId,
                    MembershipPlanTitle = member.MembershipPlan?.Title
                };

                _db.PaymentRecords.Add(record);
            }
            
            // Optionally refresh analytics materialized view (keep existing approach if needed in DB environment)
            try
            {
                var conn = _db.Database.GetDbConnection();
                await conn.OpenAsync(cancellationToken);
                using (var refreshCmd = conn.CreateCommand())
                {
                    refreshCmd.CommandText = @"REFRESH MATERIALIZED VIEW IF EXISTS gym.""MemberFinancialAnalyticsDaily"";";
                    await refreshCmd.ExecuteNonQueryAsync(cancellationToken);
                }
            }
            catch
            {
                // Non-fatal: not all DB providers support materialized view refresh via this connection.
            }

            
            

            await _smsService.SendSingleMessageAsync(member.Phone!
                , MessageList.PaymentReceivedMessage(member.FirstName, request.Amount), cancellationToken);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Payment recorded");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create payment: {ex.Message}");
        }
    }

    public async Task<List<PaymentResponse>> GetPaymentsByMembershipIdAsync(Guid memberId, CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
             throw new ArgumentException("Member id cannot be empty", nameof(memberId));

        try
        {
            var payments = await _db.PaymentRecords
                .AsNoTracking()
                .Where(p => p.MembershipId == memberId)
                .Include(p => p.Membership)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponse
                {
                    Id = p.Id,
                    MembershipId = p.MembershipId,
                    Amount = p.Amount,
                    PaymentType = p.PaymentType,
                    PaymentStatus = p.PaymentStatus,
                    StartDate = p.MemberShipStartDate,
                    EndDate = p.MemberShipEndDate,
                    TransactionReference = p.TransactionReference,
                    CreatedAt = p.CreatedAt,
                    MemberFirstName = p.Membership != null ? p.Membership.FirstName : string.Empty,
                    MemberLastName = p.Membership != null ? p.Membership.LastName : string.Empty,
                    MembershipNumber = p.Membership != null ? p.Membership.MembershipNumber : (p.MembershipNumber ?? string.Empty),
                    MembershipPlanTitle = p.MembershipPlanTitle
                })
                .ToListAsync(cancellationToken);

            return payments;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch payments by membership id: {ex.Message}");
        }
    }

    public async Task<List<PaymentResponse>> GetPaymentsByDateRangeAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default)
    {
        try
        {
            // default to last 30 days when no range provided
            var fromDate = from ?? DateTime.UtcNow.AddDays(-30);
            var toDate = to ?? DateTime.UtcNow;

            var payments = await _db.PaymentRecords
                .AsNoTracking()
                .Where(p => p.CreatedAt >= fromDate && p.CreatedAt <= toDate)
                .Include(p => p.Membership)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponse
                {
                    Id = p.Id,
                    MembershipId = p.MembershipId,
                    Amount = p.Amount,
                    PaymentType = p.PaymentType,
                    PaymentStatus = p.PaymentStatus,
                    StartDate = p.MemberShipStartDate,
                    EndDate = p.MemberShipEndDate,
                    TransactionReference = p.TransactionReference,
                    CreatedAt = p.CreatedAt,
                    MemberFirstName = p.Membership != null ? p.Membership.FirstName : string.Empty,
                    MemberLastName = p.Membership != null ? p.Membership.LastName : string.Empty,
                    MembershipNumber = p.Membership != null ? p.Membership.MembershipNumber : (p.MembershipNumber ?? string.Empty),
                    MembershipPlanTitle = p.MembershipPlanTitle
                })
                .ToListAsync(cancellationToken);

            return payments;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch payments by date range: {ex.Message}");
        }
    }
}