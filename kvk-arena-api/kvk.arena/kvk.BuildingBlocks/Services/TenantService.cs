using kvk.BuildingBlocks.Interfaces;

namespace kvk.BuildingBlocks.Services;

/// <summary>
/// Manages tenant context for the current request scope.
/// Stores tenant ID in AsyncLocal so it's available to all async operations.
/// AsyncLocal ensures the tenant context flows through async/await chains.
/// Thread-safe and request-scoped via DI container.
/// </summary>
public class TenantService : ITenantService
{
    private static readonly AsyncLocal<Guid> TenantIdContext = new();

    /// <summary>
    /// Gets the current tenant ID for this request.
    /// Returns Guid.Empty if no tenant context is set.
    /// </summary>
    public Guid GetCurrentTenantId()
    {
        return TenantIdContext.Value;
    }

    /// <summary>
    /// Sets the tenant ID for this request scope.
    /// Throws ArgumentException if tenantId is Guid.Empty.
    /// </summary>
    public void SetCurrentTenant(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty");

        TenantIdContext.Value = tenantId;
    }

    /// <summary>
    /// Clears the tenant context (typically called for cleanup).
    /// </summary>
    public void ClearCurrentTenant()
    {
        TenantIdContext.Value = Guid.Empty;
    }
}