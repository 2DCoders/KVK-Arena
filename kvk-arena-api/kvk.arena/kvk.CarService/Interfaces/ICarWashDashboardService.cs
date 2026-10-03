using kvk.CarService.Features.Dashboard;

namespace kvk.CarService.Interfaces;

public interface ICarWashDashboardService
{
    Task<CarWashDashboardResponse> GetDashboardAsync(CancellationToken cancellationToken = default);
}
