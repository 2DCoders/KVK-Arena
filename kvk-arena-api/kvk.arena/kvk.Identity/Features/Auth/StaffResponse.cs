using System.ComponentModel.DataAnnotations;
using kvk.BuildingBlocks.Common;
using kvk.Identity.Features.StaffModule;

namespace kvk.Identity.Features.Auth;

public class StaffResponse 
{
    
    public Guid Id { get; set; }
    [MaxLength(50)]
    public required string FirstName { get; set; }

    [MaxLength(50)]
    public required string LastName { get; set; }

    [MaxLength(50)]
    public required string UserName { get; set; }

    [MaxLength(100)]
    public required string Email { get; set; }

    [MaxLength(25)]
    public string? Phone { get; set; }
    
    [MaxLength(25)]
    public required string Status { get; set; }
    
    public Gender Gender { get; set; }
    
    public string[] AssignedModules { get; set; } = Array.Empty<string>();
}

