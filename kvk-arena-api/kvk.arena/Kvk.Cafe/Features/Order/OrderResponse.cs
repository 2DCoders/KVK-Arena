using kvk.Cafe.Domain;

namespace Kvk.Cafe.Features.Order;

public class OrderResponse
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public int TotalMinutesSpent { get; set; }
    public decimal SubTotalAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal DiscountedTotalAmount { get; set; }
    public bool IsPaid { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public OrderType OrderType { get; set; }
    public string? Remark { get; set; }
    public string? Address { get; set; }
    public string? DeliveryInstructions { get; set; }
    public string? DeliveryTime { get; set; }
    public string? DeliveryPerson { get; set; }
    public string? DeliveryPersonPhone { get; set; }
    public string? TableNumber { get; set; }
    
    public List<OrderItemResponse> OrderItems { get; set; } = new();
}