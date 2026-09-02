using kvk.Cafe.Domain;

namespace Kvk.Cafe.Features.Order;

public class OrderUpdateRequest : OrderCreateRequest
{
    public Guid Id { get; set; }
}