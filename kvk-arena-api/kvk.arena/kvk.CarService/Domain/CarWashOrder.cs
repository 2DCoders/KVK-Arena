using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using kvk.BuildingBlocks.Common;

namespace kvk.CarService.Domain;

public class CarWashOrder : AuditableEntity
{

    [MaxLength(100)]
    public required string OrderNumber { get; set; } = string.Empty;

    [Column(TypeName = "timestamp without time zone")]    
    public required DateTime OrderDate { get; set; } = DateTime.Now;

    [MaxLength(100)]
    public string? CustomerName { get; set; } =  string.Empty;

    [MaxLength(10)]
    public string? CustomerPhone { get; set; } =  string.Empty;
    
    [MaxLength(15)]
    public string? VehicleNumber { get; set; } =  string.Empty;

    public VehicleType VehicleType { get; set; }

    public int TotalMinutesSpent { get; set; }

    public decimal SubTotalAmount { get; set; }

    public decimal Discount { get; set; }

    public decimal DiscountedTotalAmount { get; set; }

    public bool IsPaid { get; set; }

    public PaymentMethod PaymentMethod { get; set; }

    public CarWashOrderStatus CarWashOrderStatus { get; set; }

    public ICollection<CarWashOrderPackage> Packages { get; set; } = new List<CarWashOrderPackage>();

    public ICollection<CarWashOrderService> Services { get; set; } = new List<CarWashOrderService>();
}


public enum PaymentMethod
{
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    Online = 4
}

public enum VehicleType
{
    Car = 1,
    Truck = 2,
    Van = 3,
    Jeep = 4,
    Lorry = 5,
    Bike = 6
}

public enum CarWashOrderStatus
{
    Pending = 1,
    InProgress = 2,
    Completed = 3,
    Cancelled = 4
}