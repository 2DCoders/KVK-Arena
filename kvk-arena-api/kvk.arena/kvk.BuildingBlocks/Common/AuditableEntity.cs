using System.ComponentModel.DataAnnotations;

namespace kvk.BuildingBlocks.Common;

/// <summary>
/// Base entity for all domain models in KVK Arena.
/// Enforces multi-tenancy (TenantId) and audit tracking (CreatedAt, CreatedBy, LastModifiedAt, LastModifiedBy).
/// Hard deletes only (no soft deletes).
/// Replaces separate BaseEntity class - this is the single merged entity base.
/// </summary>
public class AuditableEntity
{
    /// <summary>
    /// Primary key.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Tenant identifier. Enforces data isolation across tenants.
    /// All queries automatically filtered by TenantId via EF Core global query filters.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// UTC timestamp when entity was created.
    /// Auto-populated in SaveChanges().
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// UserId of the user who created the entity.
    /// Auto-populated in SaveChanges() from JWT claims.
    /// </summary>
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// UTC timestamp when entity was last modified.
    /// Auto-populated in SaveChanges().
    /// </summary>
    public DateTime LastModifiedAt { get; set; }

    /// <summary>
    /// UserId of the user who last modified the entity.
    /// Auto-populated in SaveChanges() from JWT claims.
    /// Null if entity has never been modified (only created).
    /// </summary>
    public Guid? LastModifiedBy { get; set; }
}