using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingSlotConfiguration;

public class GamingSlotConfigurationUpdateRequests
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingStationId { get; set; }

    [Required(ErrorMessage = "Start Time is required.")]
    public TimeSpan StartTime { get; set; }

    [Required(ErrorMessage = "End Time is required.")]
    public TimeSpan EndTime { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Slot Duration must be greater than zero.")]
    public int SlotDurationMinutes { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Slot Gap must be zero or greater.")]
    public int SlotGapMinutes { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than zero.")]
    public decimal Price { get; set; }

    public bool IsActive { get; set; }
}