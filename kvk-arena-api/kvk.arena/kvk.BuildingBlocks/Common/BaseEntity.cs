// ⚠️ DEPRECATED: This class has been merged with AuditableEntity
// All new entities should inherit from AuditableEntity instead.
// BaseEntity functionality is now part of AuditableEntity.
// See IMPLEMENTATION.MD for details on the merged entity model.

namespace kvk.BuildingBlocks.Common;

/// <summary>
/// DEPRECATED: Use AuditableEntity instead.
/// This class is kept for backward compatibility but should not be used in new code.
/// </summary>
[Obsolete("Use AuditableEntity instead. BaseEntity has been merged into AuditableEntity.", false)]
public class BaseEntity : AuditableEntity
{
    // No additional implementation - fully replaced by AuditableEntity
}