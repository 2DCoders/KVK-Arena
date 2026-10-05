using kvk.BuildingBlocks.Common;
using Kvk.Cafe.Features.PaymentGateway;

namespace Kvk.Cafe.Interfaces;

public interface ICafePaymentGatewayService
{
    Task<CafePaymentGatewayResponse> ProcessPayment(CafePaymentGatewayRequest request,CancellationToken cancellationToken = default);
    Task<Result> DeletePendingPayment(CafePendingPaymentDeleteRequest request, CancellationToken cancellationToken = default);
    Task VerifyPayment(PaymentNotificationRequest request);
}