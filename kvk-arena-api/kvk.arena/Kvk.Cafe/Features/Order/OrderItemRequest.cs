namespace Kvk.Cafe.Features.Order;

public class OrderItemRequest
{
    public Guid MenuId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; } = 0;
}
