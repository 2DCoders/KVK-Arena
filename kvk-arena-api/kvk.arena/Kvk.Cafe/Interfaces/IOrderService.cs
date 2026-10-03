using kvk.BuildingBlocks.Common;
using Kvk.Cafe.Features.Order;

namespace Kvk.Cafe.Interfaces;

public interface IOrderService
{
    Task<Result> CreateOrderAsync(OrderCreateRequest request, CancellationToken cancellationToken = default);
    Task<Result> UpdateOrderAsync(OrderUpdateRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteOrderAsync(Guid orderId, CancellationToken cancellationToken = default);
    Task<List<OrderResponse>> GetOrdersAsync(CancellationToken cancellationToken = default);
    Task<OrderResponse> GetOrderByIdAsync(Guid orderId, CancellationToken cancellationToken = default);
}
