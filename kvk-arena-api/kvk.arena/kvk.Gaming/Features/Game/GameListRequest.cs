using kvk.BuildingBlocks.Common;

namespace kvk.Gaming.Features.Game;

public class GameListRequest 
{
    public string? SearchTerm { get; set; }
    public Guid? GamingCategoryId { get; set; }
    public bool? IsActive { get; set; }
}