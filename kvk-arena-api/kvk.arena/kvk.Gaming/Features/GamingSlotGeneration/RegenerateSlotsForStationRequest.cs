using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingSlotGeneration;

public class RegenerateSlotsForStationRequest
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    // Optional: If a specific date range for regeneration is needed
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}