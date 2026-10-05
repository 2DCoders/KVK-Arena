using kvk.BuildingBlocks.Enums;
using kvk.Cafe.Domain;

namespace Kvk.Cafe.Features.Order;

public class OrderCreateRequest
{
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public int TotalMinutesSpent { get; set; }
    public bool IsPaid { get; set; }
    public PaymentType PaymentMethod { get; set; }
    public OrderType OrderType { get; set; }
    public string? Remark { get; set; }
    public string? Address { get; set; }
    public string? DeliveryInstructions { get; set; }
    public string? DeliveryTime { get; set; }
    public string? DeliveryPerson { get; set; }
    public string? DeliveryPersonPhone { get; set; }
    public string? TableNumber { get; set; }
    
    public List<OrderItemRequest> OrderItems { get; set; } = new();
}