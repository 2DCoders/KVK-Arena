namespace kvk.CarService.Features.CarWashOrder;

public class CarWashOrderUpdateRequest : CarWashOrderCreateRequest
{
    public Guid Id { get; set; }
}