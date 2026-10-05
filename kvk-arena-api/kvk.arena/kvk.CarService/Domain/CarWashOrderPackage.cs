using kvk.BuildingBlocks.Common;

namespace kvk.CarService.Domain;

public class CarWashOrderPackage :  BaseEntity
{
    public Guid CarWashOrderId { get; set; }

    public CarWashOrder CarWashOrder { get; set; } = default!;

    public Guid CarWashPackageId { get; set; }
    
    public Package Package { get; set; } = null!;

    
}