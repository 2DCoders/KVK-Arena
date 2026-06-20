using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Services;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using kvk.Gym.Features.PaymentGateway;
using kvk.Gym.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace kvk.Gym.Services;

public class GymPaymentGatewayService : IGymPaymentGatewayService
{
    private readonly GymDbContext _db;
    private readonly IHashService _hashService;
    private readonly ILogger<GymPaymentGatewayService> _logger;
    private readonly PayHereOptions _payHereOptions;

    public GymPaymentGatewayService(GymDbContext db, IHashService hashService, IOptions<PayHereOptions> payHereOptions, 
        ILogger<GymPaymentGatewayService> logger)
    {
        _db = db;
        _hashService = hashService;
        _logger = logger;
        _payHereOptions = payHereOptions.Value;
    }


    public async Task<PaymentGatewayResponse> ProcessPayment(PaymentGatewayRequest request)
    {
        var memberDetails = await _db.Memberships.FindAsync(request.MemberId);
        if (memberDetails == null) throw new Exception("Member not found");

        var orderId = $"ORD-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";
        var existingMember = await _db.Memberships.FindAsync(request.MemberId);

        if (existingMember != null)
        {
            existingMember.MembershipPlanId = request.MembershipPlanId;
        }
        
        _db.Memberships.Update(existingMember);

        var paymentRecord = new PaymentRecord
        {
            Amount = request.Amount,
            PaymentStatus = PaymentStatus.Pending,
            MembershipId = request.MemberId,
            PaymentType = PaymentType.DebitCard,
            TransactionReference = orderId,
        };
        _db.PaymentRecords.Add(paymentRecord);

        var memberPayment = new MemberPayment
        {
            Amount = request.Amount,
            PaymentStatus = PaymentStatus.Pending,
            MembershipId = request.MemberId,
            PaymentType = PaymentType.DebitCard,
            TransactionReference = orderId,
        };
        _db.MemberPayments.Add(memberPayment);

        await _db.SaveChangesAsync();

        var hash = _hashService.GeneratePayHereHash(
            _payHereOptions.MerchantId,
            _payHereOptions.MerchantSecret,
            orderId,
            request.Amount,
            _payHereOptions.Currency);

        return new PaymentGatewayResponse
        {
            MerchantId = _payHereOptions.MerchantId,
            OrderId = orderId,
            Currency = _payHereOptions.Currency,
            Amount = request.Amount.ToString("0.00"),
            Hash = hash
        };
    }

    public async Task VerifyPayment(PaymentNotificationRequest request)
    {
        _logger.LogInformation("Received payment notification for OrderId: {OrderId}, StatusCode: {StatusCode}",
            request.OrderId, request.StatusCode);


        var memberPayment =
            await _db.MemberPayments.FirstOrDefaultAsync(p => p.TransactionReference == request.OrderId);

        //updatePayment record as well

        var paymentRecord =
            await _db.PaymentRecords.FirstOrDefaultAsync(p => p.TransactionReference == request.OrderId);
        
        if (memberPayment == null && paymentRecord == null)
        {
            // Log or handle the case where the order is not found
            return;
        }

        var expectedMd5Sig =
            _hashService.GenerateNotificationMd5Sig(
                request.MerchantId,
                _payHereOptions.MerchantSecret,
                request.OrderId,
                request.PayhereAmount,
                request.PayhereCurrency,
                request.StatusCode);

        _logger.LogInformation("Expected MD5 Signature: {ExpectedMd5Sig}, Received MD5 Signature: {ReceivedMd5Sig}",
            expectedMd5Sig, request.Md5Sig);

        if (!string.Equals(
                expectedMd5Sig,
                request.Md5Sig,
                StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (request.StatusCode != 2)
            return;

        if (memberPayment.Amount != request.PayhereAmount)
            return;

        memberPayment.PaymentStatus = PaymentStatus.Paid;
        memberPayment.TransactionReference = request.PaymentId;
        paymentRecord.PaymentStatus = PaymentStatus.Paid;


        _logger.LogInformation("Payment verified for OrderId: {OrderId}. Updating payment status to Paid.",
            request.OrderId);

        await _db.SaveChangesAsync();

        _logger.LogInformation("Payment status updated to Paid for OrderId: {OrderId}", request.OrderId);
    }
}