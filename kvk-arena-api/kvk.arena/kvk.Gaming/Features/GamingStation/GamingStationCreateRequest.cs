using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingStation;

public class GamingStationCreateRequest
{
    [Required(ErrorMessage = "Gaming Category ID is required.")]
    public Guid GamingCategoryId { get; set; }

    // GameId is optional for categories like 'POOL'
    public Guid? GameId { get; set; }

    [Required(ErrorMessage = "Station Code is required.")]
    [StringLength(50, ErrorMessage = "Station Code cannot exceed 50 characters.")]
    public required string StationCode { get; set; }

    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
    public required string Name { get; set; }

    public bool IsActive { get; set; } = true; // Default to active
}