using Kvk.Cafe.Features.Dashboard;

namespace Kvk.Cafe.Interfaces;

public interface ICafeDashboardService
{
    Task<CafeDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
}
