namespace kvk.BuildingBlocks.Interfaces;

/// <summary>
/// Service for managing the current tenant context within a request.
/// Tenant ID is extracted from JWT claims and made available to DbContext.
/// Uses AsyncLocal storage to ensure context flows through async operations.
/// </summary>
public interface ITenantService
{
    /// <summary>
    /// Gets the current tenant ID for the active request.
    /// Returns Guid.Empty if tenant context is not set (e.g., unauthenticated).
    /// </summary>
    Guid GetCurrentTenantId();

    /// <summary>
    /// Sets the current tenant ID for the active request scope.
    /// Called by TenantPermissionMiddleware after JWT validation.
    /// </summary>
    void SetCurrentTenant(Guid tenantId);

    /// <summary>
    /// Clears the tenant context (used for cleanup).
    /// </summary>
    void ClearCurrentTenant();
}