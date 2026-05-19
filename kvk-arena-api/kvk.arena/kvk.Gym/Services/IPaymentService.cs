using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.Payments;

namespace kvk.Gym.Services;

public interface IPaymentService
{
    Task<Result> CreatePaymentAsync(Guid memberId, CreatePaymentRequest request, CancellationToken cancellationToken = default);
}
