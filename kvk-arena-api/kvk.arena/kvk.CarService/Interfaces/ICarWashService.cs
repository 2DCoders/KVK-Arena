using kvk.BuildingBlocks.Common;
using kvk.CarService.Features.CarWashService;

namespace kvk.CarService.Interfaces;

public interface ICarWashService
{
     Task<Result> CreateCarWashServiceAsync(CarWashCreateRequest carService, CancellationToken cancellationToken = default);
    
     Task<Result> UpdateCarWashServiceAsync(CarWashUpdateRequest carService, CancellationToken cancellationToken = default);
     
     Task<Result> DeleteCarWashServiceAsync(Guid serviceId, CancellationToken cancellationToken = default);
     
     Task<List<CarWashServiceResponse>> GetCarWashServiceAsync(Guid serviceId, CancellationToken cancellationToken = default);
     
     Task<CarWashServiceResponse?> GetCarWashServiceByIdAsync(Guid carWashServiceId, CancellationToken cancellationToken = default);
     
     
    
}