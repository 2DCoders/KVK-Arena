namespace kvk.Cafe.Domain;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = default!;
    public Guid MenuId { get; set; }
    public Menu Menu { get; set; } = default!;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Discount { get; set; } = 0;
    public decimal DiscountedPrice { get; set; } = 0;
}