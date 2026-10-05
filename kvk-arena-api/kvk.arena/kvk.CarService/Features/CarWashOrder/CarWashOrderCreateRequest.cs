using kvk.CarService.Domain;

namespace kvk.CarService.Features.CarWashOrder;

public class CarWashOrderCreateRequest
{
    
    public string? CustomerName { get; set; } = default!;

    public string? CustomerPhone { get; set; } = default!;

    public VehicleType VehicleType { get; set; }
    
    public string? VehicleNumber { get; set; } =  string.Empty;

    
    public decimal SubTotalAmount { get; set; }

    public decimal Discount { get; set; } = 0;

    public decimal DiscountedTotalAmount { get; set; }

    public bool IsPaid { get; set; }

    public PaymentMethod PaymentMethod { get; set; }

    public CarWashOrderStatus CarWashOrderStatus { get; set; }

    public List<Guid>? PackageIds { get; set; } = new List<Guid>();

    public List<Guid> ServicesIds { get; set; } = new List<Guid>();
    
}