using System.ComponentModel.DataAnnotations;

namespace kvk.Gaming.Features.GamingCategory;

public class GamingCategoryCreateRequest
{
    [Required(ErrorMessage = "Name is required.")]
    [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters.")]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Code is required.")]
    public required string Code { get; set; }
    
    public decimal Price { get; set; }

}