using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.BuildingBlocks.Persistence;

/// <summary>
/// Base database context for all KVK Arena modules.
/// Enforces:
/// - Multi-tenancy via global TenantId query filters
/// - Audit trail stamping in SaveChanges()
/// - Single database, shared schema with automatic tenant isolation
/// </summary>
public abstract class AppDbContextBase : DbContext
{
    private readonly ITenantService _tenantService;
    private readonly ILogger<AppDbContextBase> _logger;
    private readonly IHttpContextAccessor? _httpContextAccessor;

    protected AppDbContextBase(
        DbContextOptions options,
        ITenantService tenantService,
        ILogger<AppDbContextBase> logger,
        IHttpContextAccessor? httpContextAccessor = null)
        : base(options)
    {
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Configures model relationships, constraints, and global query filters.
    /// Automatically discovers and applies HasQueryFilter for all AuditableEntity types.
    /// Also configures indexes for tenant-based queries.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Get all entity types that inherit from AuditableEntity
        var auditableEntities = modelBuilder.Model.GetEntityTypes()
            .Where(t => typeof(AuditableEntity).IsAssignableFrom(t.ClrType))
            .ToList();

        // Apply global query filter for tenant isolation to all AuditableEntity types
        foreach (var entityType in auditableEntities)
        {
            var method = GetType()
                .GetMethods(BindingFlags.NonPublic | BindingFlags.Instance)
                .FirstOrDefault(m => m.Name == nameof(ApplyTenantFilter) && m.IsGenericMethodDefinition)
                ?.MakeGenericMethod(entityType.ClrType);

            method?.Invoke(this, new object[] { modelBuilder });
        }

        // Configure indexes for common queries
        foreach (var entityType in auditableEntities)
        {
            // Index on TenantId for basic filtering
            modelBuilder.Entity(entityType.ClrType)
                .HasIndex(nameof(AuditableEntity.TenantId))
                .HasDatabaseName($"IX_{entityType.ClrType.Name}_TenantId");

            // Composite index on (TenantId, CreatedAt) for timeline queries
            modelBuilder.Entity(entityType.ClrType)
                .HasIndex(new[] { nameof(AuditableEntity.TenantId), nameof(AuditableEntity.CreatedAt) })
                .HasDatabaseName($"IX_{entityType.ClrType.Name}_TenantId_CreatedAt");
        }
    }

    /// <summary>
    /// Generic method to apply global query filter for tenant isolation.
    /// Ensures all queries automatically include: WHERE TenantId == {currentTenantId}
    /// This is called during OnModelCreating for each AuditableEntity type.
    /// </summary>
    private void ApplyTenantFilter<T>(ModelBuilder modelBuilder) where T : AuditableEntity
    {
        modelBuilder.Entity<T>()
            .HasQueryFilter(e => e.TenantId == _tenantService.GetCurrentTenantId());
    }

    /// <summary>
    /// Override SaveChanges to automatically capture audit information.
    /// - Sets CreatedAt, CreatedBy for new entities
    /// - Sets LastModifiedAt, LastModifiedBy for modified entities
    /// Throws InvalidOperationException if no tenant context is set.
    /// </summary>
    public override int SaveChanges()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == Guid.Empty)
        {
            _logger.LogWarning("SaveChanges called without tenant context");
            throw new InvalidOperationException("Tenant context is required for database operations");
        }

        ApplyAuditTrail(tenantId);
        return base.SaveChanges();
    }

    /// <summary>
    /// Override SaveChangesAsync to automatically capture audit information (async version).
    /// - Sets CreatedAt, CreatedBy for new entities
    /// - Sets LastModifiedAt, LastModifiedBy for modified entities
    /// Throws InvalidOperationException if no tenant context is set.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (tenantId == Guid.Empty)
        {
            _logger.LogWarning("SaveChangesAsync called without tenant context");
            throw new InvalidOperationException("Tenant context is required for database operations");
        }

        ApplyAuditTrail(tenantId);
        return await base.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Applies audit trail to all changed entities.
    /// For new (Added) entities: sets TenantId, CreatedAt, CreatedBy, LastModifiedAt
    /// For modified (Modified) entities: sets LastModifiedAt, LastModifiedBy
    /// Protects audit fields from being overwritten by preventing modification re-entry.
    /// </summary>
    private void ApplyAuditTrail(Guid tenantId)
    {
        var now = DateTime.UtcNow;
        var currentUserId = GetCurrentUserId();

        var entries = ChangeTracker.Entries<AuditableEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.TenantId = tenantId;
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy = currentUserId;
                    entry.Entity.LastModifiedAt = now;
                    _logger.LogInformation(
                        "Entity created: {EntityType}, Id: {Id}, TenantId: {TenantId}, CreatedBy: {CreatedBy}",
                        entry.Entity.GetType().Name, entry.Entity.Id, tenantId, currentUserId);
                    break;

                case EntityState.Modified:
                    entry.Entity.LastModifiedAt = now;
                    entry.Entity.LastModifiedBy = currentUserId;
                    // Prevent re-modification of critical fields
                    entry.Property(nameof(AuditableEntity.CreatedAt)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.CreatedBy)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.TenantId)).IsModified = false;
                    _logger.LogInformation(
                        "Entity modified: {EntityType}, Id: {Id}, LastModifiedBy: {UserId}",
                        entry.Entity.GetType().Name, entry.Entity.Id, currentUserId);
                    break;
            }
        }
    }

    /// <summary>
    /// Extracts current user ID from JWT claims via HttpContext.
    /// Searches for "UserId" claim first, then falls back to NameIdentifier claim.
    /// Returns Guid.Empty if user context is not available (e.g., unauthenticated requests).
    /// </summary>
    protected virtual Guid GetCurrentUserId()
    {
        if (_httpContextAccessor?.HttpContext?.User == null)
            return Guid.Empty;

        var userIdClaim = _httpContextAccessor.HttpContext.User
            .FindFirst("UserId")?.Value
            ?? _httpContextAccessor.HttpContext.User
                .FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}