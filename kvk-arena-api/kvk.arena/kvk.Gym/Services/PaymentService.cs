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
            }
            
            var conn = _db.Database.GetDbConnection();
            await conn.OpenAsync(cancellationToken);
            // Refresh the materialized view to ensure analytics are up-to-date.
            using (var refreshCmd = conn.CreateCommand())
            {
                refreshCmd.CommandText = @"REFRESH MATERIALIZED VIEW gym.""MemberFinancialAnalyticsDaily"";";
                // Execute refresh (may take time depending on data size)
                await refreshCmd.ExecuteNonQueryAsync(cancellationToken);
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
}