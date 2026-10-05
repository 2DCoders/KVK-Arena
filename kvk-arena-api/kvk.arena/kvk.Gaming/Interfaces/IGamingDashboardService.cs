using kvk.Gaming.Features.Dashboard;

namespace kvk.Gaming.Interfaces;

public interface IGamingDashboardService
{
    Task<GamingDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
}
