using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.Game;

public class GameUpdateRequest
{
    public Guid Id { get; set; }

    [Required(ErrorMessage = "Gaming Category ID is required.")]
    public Guid GamingCategoryId { get; set; }

    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
    public required string Name { get; set; }

    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters.")]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}