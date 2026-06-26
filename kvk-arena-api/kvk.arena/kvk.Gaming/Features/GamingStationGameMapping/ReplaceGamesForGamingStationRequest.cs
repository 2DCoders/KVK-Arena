using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingStationGameMapping;

public class ReplaceGamesForGamingStationRequest
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

}