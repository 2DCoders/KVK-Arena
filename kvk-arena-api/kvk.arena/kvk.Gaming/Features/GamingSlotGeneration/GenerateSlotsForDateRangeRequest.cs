using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingSlotGeneration;

public class GenerateSlotsForDateRangeRequest
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    [Required(ErrorMessage = "Start Date is required.")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "End Date is required.")]
    public DateTime EndDate { get; set; }
}