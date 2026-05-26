namespace kvk.BuildingBlocks.Common;

/// <summary>
/// Extension of BaseEntity that adds audit tracking fields.
/// Use this for entities that need created/modified tracking.
/// </summary>
public class AuditableEntity : BaseEntity
{

    /// <summary>
    /// Local timestamp when entity was created.
    /// Auto-populated in SaveChanges().
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// UserId of the user who created the entity.
    /// Auto-populated in SaveChanges() from JWT claims.
    /// </summary>
    public Guid CreatedBy { get; set; }

    /// <summary>
    /// Local timestamp when entity was last modified.
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