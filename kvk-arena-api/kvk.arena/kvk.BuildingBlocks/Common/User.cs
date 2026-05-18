using System.ComponentModel.DataAnnotations;

namespace kvk.BuildingBlocks.Common;

/// <summary>
/// Shared base user for staff and future module-specific member accounts.
/// </summary>
public class User : AuditableEntity
{
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

    [MaxLength(256)]
    public required string PasswordHash { get; set; }

    [MaxLength(25)]
    public required string Status { get; set; }
}

