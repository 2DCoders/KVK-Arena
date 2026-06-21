namespace kvk.Gaming.Features.GamingStationGameMapping;

public class GamingStationGameMappingResponse
{
    public Guid GamingStationId { get; set; }
    public string GamingStationName { get; set; } = string.Empty;
    public Guid GameId { get; set; }
    public string GameName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}