using kvk.BuildingBlocks.Common;
using kvk.CarService.Features.CarWashService;

namespace kvk.CarService.Domain;

public class CarWashOrderService : BaseEntity
{
    public Guid CarWashOrderId { get; set; }

    public CarWashOrder CarWashOrder { get; set; } = default!;

    public Guid CarWashServiceId { get; set; }
    
    public CarService Service { get; set; } = null!;

    
}