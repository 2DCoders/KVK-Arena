using kvk.BuildingBlocks.Interfaces;

namespace kvk.BuildingBlocks.Services;

/// <summary>
/// Manages tenant context for the current request scope.
/// Phase 1: Always returns hardcoded tenant ID (00000000-0000-0000-0000-000000000000).
/// This will be replaced with dynamic tenant resolution in Phase 2.
/// </summary>
public class TenantService : ITenantService
{
    // Phase 1 hardcoded tenant ID
    private static readonly Guid HardcodedTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    /// <summary>
    /// Gets the current tenant ID for this request.
    /// Phase 1: Always returns the hardcoded tenant ID.
    /// </summary>
    public Guid GetCurrentTenantId()
    {
        return HardcodedTenantId;
    }

    /// <summary>
    /// Sets the tenant ID for this request scope.
    /// Phase 1: Ignored - tenant is always the hardcoded value.
    /// </summary>
    public void SetCurrentTenant(Guid tenantId)
    {
        // Phase 1: tenant is always hardcoded, ignore calls to this method
    }

    /// <summary>
    /// Clears the tenant context (typically called for cleanup).
    /// Phase 1: No-op since tenant is always hardcoded.
    /// </summary>
    public void ClearCurrentTenant()
    {
        // Phase 1: no-op
    }
}