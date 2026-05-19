using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using Microsoft.EntityFrameworkCore;
using kvk.Gym.Features.Payments;

namespace kvk.Gym.Services;

public class PaymentService : IPaymentService
{
    private readonly GymDbContext _db;

    public PaymentService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreatePaymentAsync(Guid memberId, CreatePaymentRequest request, CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships.SingleOrDefaultAsync(m => m.Id == memberId, cancellationToken);
            if (member == null)
                return Result.Failure("Member not found");

            if (member.MemberType != kvk.Gym.Enums.MemberType.Client)
                return Result.Failure("Payments are only applicable to clients");

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
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Payment recorded").WithData("paymentId", payment.Id);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create payment: {ex.Message}");
        }
    }
}


