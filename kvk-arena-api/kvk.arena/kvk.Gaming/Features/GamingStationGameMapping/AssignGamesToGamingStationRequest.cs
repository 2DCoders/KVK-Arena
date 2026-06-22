using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingStationGameMapping;

public class AssignGamesToGamingStationRequest
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    [Required(ErrorMessage = "At least one Game ID is required.")]
    public List<Guid> GameIds { get; set; } = new List<Guid>();
}