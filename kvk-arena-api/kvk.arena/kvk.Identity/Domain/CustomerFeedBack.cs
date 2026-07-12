using System.ComponentModel.DataAnnotations;

namespace kvk.Identity.Domain;

public class CustomerFeedBack
{
    [Key]
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    [EmailAddress]
    public required string Email { get; set; }
    
    public string? Phone { get; set; }
    
    [MaxLength(1000)]
    public required string FeedBack { get; set; }
}