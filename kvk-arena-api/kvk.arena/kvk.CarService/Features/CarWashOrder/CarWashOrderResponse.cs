using kvk.CarService.Domain;
using kvk.CarService.Features.CarWashService;

namespace kvk.CarService.Features.CarWashOrder;

public class CarWashOrderResponse
{
    
    public Guid CarWashOrderId { get; set; }
    public required string OrderNumber { get; set; } = string.Empty;

    public required DateTime OrderDate { get; set; } = DateTime.Now;

    public string? CustomerName { get; set; } =  string.Empty;

    public string? CustomerPhone { get; set; } =  string.Empty;

    public VehicleType VehicleType { get; set; }

    public int TotalMinutesSpent { get; set; }

    public decimal SubTotalAmount { get; set; }

    public decimal Discount { get; set; }

    public decimal DiscountedTotalAmount { get; set; }

    public bool IsPaid { get; set; }

    public PaymentMethod PaymentMethod { get; set; }

    public CarWashOrderStatus CarWashOrderStatus { get; set; }
    
    public List<CarWashOrderPackageResponse> Packages { get; set; } = new List<CarWashOrderPackageResponse>();

    public List<CarWashOrderServiceResponse> Services { get; set; } = new List<CarWashOrderServiceResponse>();
}


public class CarWashOrderServiceResponse
{
    public Guid CarWashServiceId { get; set; }
    
    // Snapshot Values
    public string ServiceName { get; set; } = default!;

    public decimal ServicePrice { get; set; }
}


public class CarWashOrderPackageResponse
{
    public Guid CarWashPackageId { get; set; }
    
    // Snapshot Values
    public string PackageName { get; set; } = default!;

    public decimal PackagePrice { get; set; }
}