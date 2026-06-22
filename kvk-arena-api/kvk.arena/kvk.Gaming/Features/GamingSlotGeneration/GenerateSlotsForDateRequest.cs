using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingSlotGeneration;

public class GenerateSlotsForDateRequest
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    [Required(ErrorMessage = "Date is required.")]
    public DateTime Date { get; set; }
}