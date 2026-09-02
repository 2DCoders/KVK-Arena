namespace Kvk.Cafe.Features.Order;

public class OrderItemResponse
{
    public Guid Id { get; set; }
    public Guid MenuId { get; set; }
    public string MenuName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; }
    public decimal DiscountedPrice { get; set; }
}
