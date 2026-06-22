namespace kvk.Gaming.Features.GamingStation;

public class GamingStationListRequest
{
    public string? SearchTerm { get; set; }
    public Guid? GamingCategoryId { get; set; }
    public bool? IsActive { get; set; }
}