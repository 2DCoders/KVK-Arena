using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.PaymentGateway;

namespace kvk.Gym.Interfaces;

public interface IGymPaymentGatewayService 
{
    Task<PaymentGatewayResponse> ProcessPayment(PaymentGatewayRequest request);
    Task<Result> DeletePendingPayment(PendingPaymentDeleteRequest request, CancellationToken cancellationToken = default);
    Task VerifyPayment(PaymentNotificationRequest request);
}