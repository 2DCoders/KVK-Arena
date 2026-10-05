using kvk.Gym.Features.Dashboard;

namespace kvk.Gym.Interfaces;

public interface IGymDashboardService
{
    Task<GymDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
}
