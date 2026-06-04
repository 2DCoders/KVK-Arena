using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using kvk.Gym.Features.PaymentGateway;
using kvk.Gym.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gym.Services;

public class GymPaymentGatewayService : IGymPaymentGatewayService
{
    private readonly GymDbContext _db;
    private readonly IHashService _hashService;
    private readonly PayHereOptions _payHereOptions;

    public GymPaymentGatewayService(GymDbContext db, IHashService hashService, IOptions<PayHereOptions> payHereOptions)
    {
        _db = db;
        _hashService = hashService;
        _payHereOptions = payHereOptions.Value;
    }


    public async Task<PaymentGatewayResponse> ProcessPayment(PaymentGatewayRequest request)
    {
        var memberDetails = await _db.Memberships.FindAsync(request.MemberId);
        if (memberDetails == null) throw new Exception("Member not found");

        var orderId = $"ORD-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper()}";

        var paymentRecord = new PaymentRecord
        {
            Amount = request.Amount,
            PaymentStatus = Enums.PaymentStatus.Pending,
            MembershipId = request.MemberId,
            PaymentType = PaymentType.DebitCard,
        };
        _db.PaymentRecords.Add(paymentRecord);

        var memberPayment = new MemberPayment
        {
            Amount = request.Amount,
            PaymentStatus = Enums.PaymentStatus.Pending,
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
        var memberPayment = await _db.MemberPayments.FirstOrDefaultAsync(p => p.TransactionReference == request.OrderId);
        if (memberPayment == null)
        {
            // Log or handle the case where the order is not found
            return;
        }
        
        var expectedHash = _hashService.GeneratePayHereHash(
            request.MerchantId,
            _payHereOptions.MerchantSecret,
            request.OrderId,
            request.PayhereAmount,
            request.PayhereCurrency);

        if (expectedHash.Equals(request.Md5Sig, StringComparison.OrdinalIgnoreCase) && request.StatusCode == 2)
        {
            memberPayment.PaymentStatus = Enums.PaymentStatus.Paid;
            memberPayment.TransactionReference = request.PaymentId;
            
            
            await _db.SaveChangesAsync();
        }
        else
        {
            // Log or handle invalid signature or status code
        }
    }
}