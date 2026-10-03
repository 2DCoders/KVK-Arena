using kvk.Saloon.Features.Dashboard;

namespace kvk.Saloon.Interfaces;

public interface ISaloonDashboardService
{
    Task<SaloonDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
}
