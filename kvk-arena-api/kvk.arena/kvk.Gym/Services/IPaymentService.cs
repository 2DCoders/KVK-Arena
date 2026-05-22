using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.Payments;

namespace kvk.Gym.Services;

public interface IPaymentService
{
    Task<Result> CreatePaymentAsync(Guid memberId, CreatePaymentRequest request, CancellationToken cancellationToken = default);

    // Get payments for a specific membership (member)
    Task<Result> GetPaymentsByMembershipIdAsync(Guid memberId, CancellationToken cancellationToken = default);

    // Get payments filtered by created date range (from/to inclusive). If both null, returns recent payments.
    Task<Result> GetPaymentsByDateRangeAsync(DateTime? from, DateTime? to, CancellationToken cancellationToken = default);
}
