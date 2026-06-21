using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingStationGameMapping;

public class RemoveGameFromGamingStationRequest
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    [Required(ErrorMessage = "Game ID is required.")]
    public Guid GameId { get; set; }
}