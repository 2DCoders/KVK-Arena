using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Constants;
using kvk.BuildingBlocks.Enums;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.PaymentGateway;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using kvk.Gym.Features.Payments;

namespace kvk.Gym.Services;

public class PaymentService : IPaymentService
{
    private const string CashierReferencePrefix = "GYM-CASHIER-";
    private readonly GymDbContext _db;
    private readonly ISmsService _smsService;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(GymDbContext db, ISmsService smsService, ILogger<PaymentService> logger)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _smsService = smsService;
        _logger = logger;
    }

    public async Task<Result> CreatePaymentAsync(Guid memberId, CreatePaymentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        if (request.PaymentType == PaymentType.ReceiptUpload && request.Receipt is null)
            return Result.Failure("Upload a receipt for this payment method.");
        var receiptType = request.Receipt is { } document ? GymPaymentReceipt.DetectContentType(document) : null;
        if (request.Receipt != null && receiptType is null) return Result.Failure(GymPaymentReceipt.InvalidFileMessage);
        if (request.Receipt != null && request.PaymentStatus != PaymentStatus.Paid)
            return Result.Failure("A receipt can only be attached to a paid transaction.");

        try
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(cancellationToken);
            // Serialize cashier payments for the same member across API instances.
            await _db.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_xact_lock(73040301, hashtext({memberId.ToString()}))", cancellationToken);
            var reference = request.TransactionReference;
            if (reference?.StartsWith(CashierReferencePrefix, StringComparison.Ordinal) == true)
            {
                if (!Guid.TryParseExact(reference[CashierReferencePrefix.Length..], "D", out _))
                    return Result.Failure("Invalid cashier payment reference.");

                var recorded = await _db.PaymentRecords.AsNoTracking().FirstOrDefaultAsync(
                    p => p.MembershipId == memberId && p.TransactionReference == reference, cancellationToken);
                if (recorded != null)
                {
                    if (recorded.Amount != request.Amount || recorded.PaymentType != request.PaymentType)
                        return Result.Failure("This payment reference was already used with different payment details.");
                    if (receiptType != null && recorded.PaymentStatus == PaymentStatus.Paid &&
                        !await _db.PaymentReceipts.AnyAsync(x => x.PaymentRecordId == recorded.Id, cancellationToken))
                    {
                        _db.PaymentReceipts.Add(new GymPaymentReceipt { PaymentRecordId = recorded.Id, Document = request.Receipt!, ContentType = receiptType });
                        await _db.SaveChangesAsync(cancellationToken);
                        await transaction.CommitAsync(cancellationToken);
                    }
                    return Result.Success("Payment recorded").WithData("alreadyRecorded", true);
                }
            }

            var member = await _db.Memberships.SingleOrDefaultAsync(m => m.Id == memberId, cancellationToken);
            if (member == null)
                return Result.Failure("Member not found");

            // Captured before any status change below, so a payment against a Blocked (expired)
            // member re-activates them instead of leaving them stuck as Blocked.
            var wasBlocked = member.MembershipStatus == MembershipStatus.Blocked;

            // var isCardPayment = request.PaymentType == PaymentType.CreditCard ||
            //                     request.PaymentType == PaymentType.DebitCard;
            //
            // if (isCardPayment)
            // {
            //     if (string.IsNullOrWhiteSpace(member.Email))
            //         return Result.Failure("Member email is required for card payments");
            //     if (string.IsNullOrWhiteSpace(member.Phone))
            //         return Result.Failure("Member phone is required for card payments");
            //     if (string.IsNullOrWhiteSpace(member.FirstName) || string.IsNullOrWhiteSpace(member.LastName))
            //         return Result.Failure("Member name is required for card payments");
            //
            //     var orderId = $"{member.MembershipNumber}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            //     var chargeRequest = new PaymentGatewayChargeRequest
            //     {
            //         OrderId = orderId,
            //         Amount = request.Amount,
            //         Currency = "LKR",
            //         Description = $"Membership payment for {member.MembershipNumber}",
            //         Customer = new PaymentGatewayCustomer
            //         {
            //             FirstName = member.FirstName,
            //             LastName = member.LastName,
            //             Email = member.Email,
            //             Phone = member.Phone!
            //         },
            //         AdditionalFields = new Dictionary<string, string>
            //         {
            //             ["membership_id"] = member.Id.ToString(),
            //             ["membership_number"] = member.MembershipNumber
            //         }
            //     };
            //
            //     var chargeResult = await _gatewayService.CreateChargeAsync(chargeRequest, cancellationToken);
            //     if (!chargeResult.Succeeded)
            //         return Result.Failure($"Payment gateway charge failed: {chargeResult.Message ?? "Unknown error"}");
            //
            //     if (!string.IsNullOrWhiteSpace(chargeResult.GatewayReference))
            //         request.TransactionReference = chargeResult.GatewayReference;
            // }

            var memberPayment = await _db.MemberPayments
                .Where(p => p.MembershipId == memberId)
                .OrderByDescending(p => p.CreatedAt)
                .ThenByDescending(p => p.Id)
                .FirstOrDefaultAsync(cancellationToken);

            PaymentRecord record;
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

                record = new PaymentRecord
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

            }
            else
            {
                var membershipPlan =
                    await _db.MembershipPlans.FirstOrDefaultAsync(mp => mp.Id == member.MembershipPlanId,
                        cancellationToken);

                var now = DateTime.UtcNow;
                var previousEnd = await _db.MemberPayments
                    .Where(p => p.MembershipId == memberId && p.PaymentStatus == PaymentStatus.Paid)
                    .MaxAsync(p => p.MemberShipEndDate, cancellationToken);
                var expired = previousEnd is DateTime end && end <= now;
                memberPayment.MemberShipStartDate = previousEnd is DateTime futureEnd && futureEnd > now
                    ? futureEnd
                    : now;
                memberPayment.MemberShipEndDate = memberPayment.MemberShipStartDate?.AddDays(membershipPlan?.DurationInDays ?? 30);
                memberPayment.MemberShipRenewalDate = now;

                memberPayment.PaymentType = request.PaymentType;
                memberPayment.PaymentStatus = PaymentStatus.Paid;
                memberPayment.TransactionReference = request.TransactionReference;

                _db.MemberPayments.Update(memberPayment);

                if (expired || wasBlocked)
                {
                    var hasFingerprints = !string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) ||
                                           !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2);
                    member.MembershipStatus = hasFingerprints
                        ? MembershipStatus.Active
                        : MembershipStatus.Inactive;
                }

                // record the payment action in the immutable PaymentRecords table
                record = new PaymentRecord
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

            }
            _db.PaymentRecords.Add(record);
            if (receiptType != null)
                _db.PaymentReceipts.Add(new GymPaymentReceipt { PaymentRecordId = record.Id, Document = request.Receipt!, ContentType = receiptType });
            
            await _db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            // Refresh analytics after saving so it can see the new payment.
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

            if (!string.IsNullOrWhiteSpace(member.Phone))
            {
                try
                {
                    using var smsTimeout = new CancellationTokenSource(TimeSpan.FromSeconds(15));
                    var sms = await _smsService.SendSingleMessageAsync(member.Phone,
                        MessageList.PaymentReceivedMessage(member.FirstName, request.Amount), smsTimeout.Token);
                    if (!sms.Succeeded)
                        _logger.LogWarning("Payment receipt SMS was rejected for Gym member {MemberId}", member.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Payment receipt SMS failed for Gym member {MemberId}: {ErrorType}",
                        member.Id, ex.GetType().Name);
                }
            }

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
                    HasReceipt = _db.PaymentReceipts.Any(r => r.PaymentRecordId == p.Id),
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
            var fromDate = from ?? DateTime.Now.AddDays(-30);
            var toDate = to ?? DateTime.Now;
            
            
            //add daypass payments for the date range
            var dayPassPayments = await _db.DayPassMembers
                .AsNoTracking()
                .Where(p => p.CreatedAt.Date >= fromDate.Date && p.CreatedAt.Date <= toDate.Date && p.PaymentStatus == PaymentStatus.Paid)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponse
                {
                    Id = p.Id,
                    MembershipId = null,
                    IsDayPass = true,
                    HasReceipt = _db.PaymentReceipts.Any(r => r.DayPassMemberId == p.Id),
                    Amount = p.Amount,
                    PaymentType = p.PaymentType,
                    PaymentStatus = p.PaymentStatus,
                    StartDate = p.Date,
                    EndDate = p.Date,
                    TransactionReference = p.TemporaryMembershipNumber,
                    CreatedAt = p.CreatedAt,
                    MemberFirstName = p.Name,
                    MemberLastName = string.Empty,
                    MembershipNumber = p.TemporaryMembershipNumber!,
                    MembershipPlanTitle = "Day Pass"
                })
                .ToListAsync(cancellationToken);
            

            var payments = await _db.PaymentRecords
                .AsNoTracking()
                .Where(p => p.CreatedAt.Date >= fromDate.Date && p.CreatedAt.Date <= toDate.Date && p.PaymentStatus == PaymentStatus.Paid)
                .Include(p => p.Membership)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponse
                {
                    Id = p.Id,
                    MembershipId = p.MembershipId,
                    HasReceipt = _db.PaymentReceipts.Any(r => r.PaymentRecordId == p.Id),
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
            
            var allPayments = payments.Concat(dayPassPayments).OrderByDescending(p => p.CreatedAt).ToList();

            return allPayments;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch payments by date range: {ex.Message}");
        }
    }
}
