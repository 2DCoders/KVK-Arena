using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingSlotGeneration;

public class GamingCategorySlotConfigurationRequest
{
    [Required(ErrorMessage = "Gaming Station ID is required.")]
    public Guid GamingCategoryId { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int SlotDurationMinutes { get; set; }
    public int SlotGapMinutes { get; set; }
    public decimal? IsActive { get; set; }
    
    public decimal Price { get; set; }
}