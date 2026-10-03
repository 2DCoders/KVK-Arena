using kvk.Badminton.Features.Dashboard;

namespace kvk.Badminton.Interfaces;

public interface IBadmintonDashboardService
{
    Task<BadmintonDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
}
