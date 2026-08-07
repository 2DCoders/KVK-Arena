using kvk.BuildingBlocks.Common;
using kvk.CarService.Domain;
using kvk.CarService.Features.CarWashOrder;

namespace kvk.CarService.Interfaces;

public interface ICarWashOrderService
{
    Task<Result> CreateCarWashOrderAsync(CarWashOrderCreateRequest request, CancellationToken cancellationToken = default);
    
    Task<Result> UpdateCarWashOrderAsync(CarWashOrderUpdateRequest request, CancellationToken cancellationToken = default);
    
    Task<Result> DeleteCarWashOrderAsync(Guid orderId, CancellationToken cancellationToken = default);
    
    Task<List<CarWashOrderResponse>> GetCarWashOrdersAsync(CancellationToken cancellationToken = default);
    
    Task<CarWashOrderResponse> GetCarWashOrderByIdAsync(Guid orderId, CancellationToken cancellationToken = default);
    
    Task<Result> CompleteTheOrderAsync(Guid orderId, CancellationToken cancellationToken = default);
}