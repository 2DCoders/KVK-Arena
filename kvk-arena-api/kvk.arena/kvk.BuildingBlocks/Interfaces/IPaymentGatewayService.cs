using kvk.BuildingBlocks.PaymentGateway;

namespace kvk.BuildingBlocks.Interfaces;

public interface IPaymentGatewayService
{
    Task<PaymentGatewayChargeResult> CreateChargeAsync(PaymentGatewayChargeRequest request,
        CancellationToken cancellationToken = default);
}