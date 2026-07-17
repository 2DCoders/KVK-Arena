using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Domain;

public class CustomerFeedBack : AuditableEntity
{
    [Key]
    public Guid Id { get; set; }
    
    public string Name { get; set; } = string.Empty;
    
    [EmailAddress]
    public required string Email { get; set; }
    
    public string? Phone { get; set; }
    
    [MaxLength(1000)]
    public required string FeedBack { get; set; }
    
    public bool IsAddressed { get; set; }
    
    public DateTime? AddressedDate { get; set; }
    
    public string? AddressedBy { get; set; }
    
    
}