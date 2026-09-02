using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using kvk.BuildingBlocks.Common;

namespace kvk.Cafe.Domain;

public class Order : AuditableEntity
{
    //order number should create automatically with a prefix(private static method)
    [MaxLength(100)]
    public required string OrderNumber { get; set; } = string.Empty;

    [Column(TypeName = "timestamp without time zone")]    
    public required DateTime OrderDate { get; set; } = DateTime.Now;

    [MaxLength(100)]
    public string? CustomerName { get; set; } =  string.Empty;

    [MaxLength(10)]
    public string? CustomerPhone { get; set; } =  string.Empty;
    
    public int TotalMinutesSpent { get; set; }

    public decimal SubTotalAmount { get; set; }

    public decimal Discount { get; set; }

    public decimal DiscountedTotalAmount { get; set; }

    public bool IsPaid { get; set; }

    public PaymentMethod PaymentMethod { get; set; }
    
    public OrderType OrderType { get; set; }
    
    //spicy level,sugar level,etc
    public string? Remark { get; set; }
    
    public string? Address { get; set; }
    
    public string? DeliveryInstructions { get; set; }
    
    public string? DeliveryTime { get; set; }
    
    public string? DeliveryPerson { get; set; }
    
    public string? DeliveryPersonPhone { get; set; }
    
    public string? TableNumber { get; set; }
    
    public List<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

}

public enum OrderType
{
    DineIn = 1,
    TakeAway = 2,
    Delivery = 3
}

public enum PaymentMethod
{
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    Online = 4
}
