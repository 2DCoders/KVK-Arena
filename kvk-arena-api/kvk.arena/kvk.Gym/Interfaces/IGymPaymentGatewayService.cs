using kvk.Gym.Features.PaymentGateway;

namespace kvk.Gym.Interfaces;

public interface IGymPaymentGatewayService 
{
    Task<PaymentGatewayResponse> ProcessPayment(PaymentGatewayRequest request);
    Task VerifyPayment(PaymentNotificationRequest request);
}