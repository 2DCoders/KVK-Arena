namespace kvk.CarService.Features.CarWashService;

public class CarWashUpdateRequest : CarWashCreateRequest
{
    //service Id
    public Guid Id { get; set; }
}