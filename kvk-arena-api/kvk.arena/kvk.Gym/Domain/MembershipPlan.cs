using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using kvk.BuildingBlocks.Common;
using kvk.Gym.Enums;

namespace kvk.Gym.Domain;

public class MembershipPlan : AuditableEntity
{
    
    [MaxLength(100)]
    public required string Title { get; set; } = string.Empty;
    
    [MaxLength(250)]
    public string? Description { get; set; } = string.Empty;
    
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }
    
    public int DurationInDays { get; set; }
    
    public ActiveStatus IsActive { get; set; }
    
    //comma seperated list of features
    public string? Features { get; set; }
}