# KVK Arena - Implementation Architecture (Option A)

**Version 1.0** | **Date**: May 18, 2026 | **Status**: Active Development

---

## 📋 Table of Contents

- [Executive Summary](#executive-summary)
- [Architecture Overview](#architecture-overview)
- [Core Principles](#core-principles)
- [Entity Model](#entity-model)
- [Tenant Resolution Strategy](#tenant-resolution-strategy)
- [Database Context & Persistence](#database-context--persistence)
- [Module Composition Pattern](#module-composition-pattern)
- [Project Structure](#project-structure)
- [Implementation Phases](#implementation-phases)
- [Code Standards & Patterns](#code-standards--patterns)
- [Dependencies & NuGet Packages](#dependencies--nuget-packages)
- [Future Phases (Deferred)](#future-phases-deferred)

---

## Executive Summary

**KVK Arena** is a modular monolith platform using **Option A: Single Database, Shared Schema** architecture. Multiple business tenants (Gym, CarWash, Badminton, Gaming, Retail) coexist in one database with automatic `TenantId` filtering at the database context level.

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Multi-Tenancy Model** | Single Database, Shared Schema | Cost-effective, simpler deployment |
| **Tenant Identification** | JWT Claims Only | Cryptographically signed, secure, stateless |
| **Entity Base Contract** | Merged BaseEntity + Auditable | One enforced audit standard across all entities |
| **Soft Deletes** | Not Implemented | Simpler queries, full hard deletes on cleanup |
| **Query Filters** | Global (EF Core) | Automatic, less error-prone than manual filtering |
| **Audit Tracking** | SaveChanges Override | Automatic capture of CreatedAt, ModifiedAt, CreatedBy, ModifiedBy |

---

## Architecture Overview

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      kvk.Host (Main Host)                   │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Middlewares:                                            ││
│  │  - TenantPermissionMiddleware (JWT → TenantId)           ││
│  │  - ErrorHandlerMiddleware (Exception handling)           ││
│  │  - CORS, Auth, Logging, etc.                             ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            kvk.ModuleIntegrator (Module Loader)             │
│  - Discovers modules (Identity, Gym, CarWash, etc.)         │
│  - Registers module services via DI                         │
│  - Routes requests to correct module controller             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Individual Module Projects                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ kvk.Identity │  │ kvk.Gym*     │  │ kvk.CarWash* │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  (* Future modules follow same pattern)                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│          kvk.BuildingBlocks (Shared Infrastructure)         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Base Entity  │  │ Tenant Svc   │  │ Result Svc   │      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ App DbCtx    │  │ Interfaces   │  │ Common Utls  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         Single PostgreSQL/SQL Server Database                │
│  ├─ CoreUsers (TenantId, Email, PasswordHash)             │
│  ├─ GymMembers, GymMemberships, GymClasses, ...            │
│  ├─ CarWashServices, CarWashBookings, ...                  │
│  ├─ BadmintonCourts, BadmintonBookings, ...                │
│  ├─ GamingStations, GamingBookings, ...                    │
│  └─ RetailProducts, RetailOrders, ...                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Principles

### 1. **Automatic Tenant Isolation**
- Every entity inherits from `AuditableEntity` with `TenantId` property
- EF Core global query filters automatically append `WHERE TenantId = {currentTenantId}` to all queries
- **No manual TenantId filtering required** in repository code
- If a query doesn't include TenantId, it's a compile-time error if we follow patterns

### 2. **Enforced Audit Trail**
- Every entity tracks: `CreatedAt`, `CreatedBy`, `LastModifiedAt`, `LastModifiedBy`
- Automatically captured in `SaveChanges()` override
- Immutable audit history for compliance & debugging

### 3. **Stateless Tenant Context**
- Tenant resolved from JWT claim on each request
- No session/database lookups for tenant context
- `ITenantService` provides scoped access within request scope

### 4. **Modular Independence**
- Each module (Identity, Gym, CarWash) is independently deployable
- Modules register their own services via `IdentityModuleInitializer` pattern
- Host orchestrates module discovery and DI registration

### 5. **Security-First**
- JWT validation in `TenantPermissionMiddleware` before any business logic
- TenantId claim verification prevents token tampering
- Explicit tenant context required for all database operations

---

## Entity Model

### Unified Base Entity (Merged)

All entities inherit from `AuditableEntity`, which includes both tenant and audit fields:

**kvk.BuildingBlocks/Common/AuditableEntity.cs:**
```csharp
using System.ComponentModel.DataAnnotations;

namespace kvk.BuildingBlocks.Common;

/// <summary>
/// Base entity for all domain models in KVK Arena.
/// Enforces multi-tenancy (TenantId) and audit tracking (CreatedAt, CreatedBy, LastModifiedAt, LastModifiedBy).
/// Hard deletes only (no soft deletes).
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
```

### Usage Example

```csharp
// Domain model example
public class GymMember : AuditableEntity
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public DateTime MembershipStartDate { get; set; }
    public DateTime? MembershipExpireDate { get; set; }
    // TenantId, CreatedAt, CreatedBy, LastModifiedAt, LastModifiedBy inherited
}

// No manual TenantId assignment needed in business logic:
var member = new GymMember
{
    FirstName = "John",
    LastName = "Doe",
    Email = "john@gym.com",
    // TenantId, CreatedAt, CreatedBy auto-filled in SaveChanges()
};
```

---

## Tenant Resolution Strategy

### Request Flow: JWT Claim → TenantService → DbContext

```
┌──────────────────────────┐
│  Client HTTP Request     │
│  Authorization Header    │
│  Bearer {JWT_TOKEN}      │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│ TenantPermissionMiddleware                       │
│ 1. Extract Authorization header                  │
│ 2. Validate JWT token (signature, expiration)   │
│ 3. Extract TenantId claim from token           │
│ 4. Pass to ITenantService.SetCurrentTenant()   │
└────────────┬─────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│ ITenantService (DI Container)                    │
│ - Stores TenantId in AsyncLocal<T>              │
│ - Available to all downstream services          │
│ - DbContext reads from here                     │
└────────────┬─────────────────────────────────────┘
             │
             ↓
┌──────────────────────────────────────────────────┐
│ AppDbContext                                      │
│ 1. OnModelCreating() sets global query filters  │
│ 2. Gets current TenantId from ITenantService   │
│ 3. All queries: WHERE TenantId = {TenantId}    │
└──────────────────────────────────────────────────┘
```

### Implementation Details

**ITenantService Interface:**
```csharp
namespace kvk.BuildingBlocks.Interfaces;

/// <summary>
/// Service for managing the current tenant context within a request.
/// Tenant ID is extracted from JWT claims and made available to DbContext.
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
```

**TenantService Implementation:**
```csharp
namespace kvk.BuildingBlocks.Services;

using kvk.BuildingBlocks.Interfaces;

/// <summary>
/// Manages tenant context for the current request.
/// Stores tenant ID in AsyncLocal so it's available to all async operations.
/// </summary>
public class TenantService : ITenantService
{
    private static readonly AsyncLocal<Guid> TenantIdContext = new();

    public Guid GetCurrentTenantId()
    {
        return TenantIdContext.Value;
    }

    public void SetCurrentTenant(Guid tenantId)
    {
        if (tenantId == Guid.Empty)
            throw new ArgumentException("Tenant ID cannot be empty");

        TenantIdContext.Value = tenantId;
    }

    public void ClearCurrentTenant()
    {
        TenantIdContext.Value = Guid.Empty;
    }
}
```

---

## Database Context & Persistence

### AppDbContextBase Implementation

```csharp
namespace kvk.BuildingBlocks.Persistence;

using Microsoft.EntityFrameworkCore;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;

/// <summary>
/// Base database context for all KVK Arena modules.
/// Enforces:
/// - Multi-tenancy via global TenantId query filters
/// - Audit trail stamping in SaveChanges()
/// - Single database, shared schema with tenant isolation
/// </summary>
public abstract class AppDbContextBase : DbContext
{
    private readonly ITenantService _tenantService;
    private readonly ILogger<AppDbContextBase> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;

    protected AppDbContextBase(
        DbContextOptions options,
        ITenantService tenantService,
        ILogger<AppDbContextBase> logger,
        IHttpContextAccessor httpContextAccessor = null) 
        : base(options)
    {
        _tenantService = tenantService ?? throw new ArgumentNullException(nameof(tenantService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Configures model relationships, constraints, and global query filters.
    /// MUST apply HasQueryFilter for all AuditableEntity types.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Get all entity types that inherit from AuditableEntity
        var auditableEntities = modelBuilder.Model.GetEntityTypes()
            .Where(t => typeof(AuditableEntity).IsAssignableFrom(t.ClrType))
            .ToList();

        // Apply global query filter for tenant isolation
        foreach (var entityType in auditableEntities)
        {
            var method = typeof(AppDbContextBase)
                .GetMethod(nameof(ApplyTenantFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)
                ?.MakeGenericMethod(entityType.ClrType);

            method?.Invoke(null, new object[] { modelBuilder, _tenantService });
        }

        // Configure indexes for common queries
        foreach (var entityType in auditableEntities)
        {
            modelBuilder.Entity(entityType.ClrType)
                .HasIndex(nameof(AuditableEntity.TenantId))
                .HasName($"IX_{entityType.ClrType.Name}_TenantId");

            modelBuilder.Entity(entityType.ClrType)
                .HasIndex(new[] { nameof(AuditableEntity.TenantId), nameof(AuditableEntity.CreatedAt) })
                .HasName($"IX_{entityType.ClrType.Name}_TenantId_CreatedAt");
        }
    }

    /// <summary>
    /// Generic method to apply global query filter for tenant isolation.
    /// Ensures {entity => entity.TenantId == currentTenantId} is applied to all queries.
    /// </summary>
    private static void ApplyTenantFilter<T>(ModelBuilder modelBuilder, ITenantService tenantService) 
        where T : AuditableEntity
    {
        modelBuilder.Entity<T>()
            .HasQueryFilter(e => e.TenantId == tenantService.GetCurrentTenantId());
    }

    /// <summary>
    /// Override SaveChanges to automatically capture audit information.
    /// - Sets CreatedAt, CreatedBy for new entities
    /// - Sets LastModifiedAt, LastModifiedBy for modified entities
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
                    _logger.LogInformation("Entity created: {EntityType}, Id: {Id}, TenantId: {TenantId}",
                        entry.Entity.GetType().Name, entry.Entity.Id, tenantId);
                    break;

                case EntityState.Modified:
                    entry.Entity.LastModifiedAt = now;
                    entry.Entity.LastModifiedBy = currentUserId;
                    entry.Property(nameof(AuditableEntity.CreatedAt)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.CreatedBy)).IsModified = false;
                    entry.Property(nameof(AuditableEntity.TenantId)).IsModified = false;
                    _logger.LogInformation("Entity modified: {EntityType}, Id: {Id}",
                        entry.Entity.GetType().Name, entry.Entity.Id);
                    break;
            }
        }
    }

    /// <summary>
    /// Extracts current user ID from JWT claims via HttpContext.
    /// Returns UserId claim from HttpContext.User.
    /// </summary>
    protected virtual Guid GetCurrentUserId()
    {
        var userIdClaim = _httpContextAccessor?.HttpContext?.User?.FindFirst("UserId")?.Value 
                          ?? _httpContextAccessor?.HttpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        
        return Guid.TryParse(userIdClaim, out var userId) ? userId : Guid.Empty;
    }
}
```

---

## Module Composition Pattern

### IModuleInitializer Interface

```csharp
namespace kvk.BuildingBlocks.Interfaces;

/// <summary>
/// Contract for module initialization and service registration.
/// Each module implements this to register its services and DbContext.
/// </summary>
public interface IModuleInitializer
{
    /// <summary>
    /// Registers module services, DbContext, and other dependencies in the DI container.
    /// Called during application startup from kvk.Host.Program.cs.
    /// </summary>
    void RegisterModule(IServiceCollection services, IConfiguration configuration);
}
```

---

## Project Structure

```
kvk.arena/
│
├── README.MD                          # Product overview
├── IMPLEMENTATION.MD                  # This file - architectural blueprint
├── kvk.arena.sln                      # Visual Studio solution
│
├── kvk.Host/                          # Main API Host & Gateway
│   ├── Program.cs                     # Startup configuration, middleware pipeline
│   ├── kvk.Host.csproj
│   ├── appsettings.json               # Database, logging config
│   ├── appsettings.Development.json   # Dev-specific settings
│   │
│   ├── Middlewares/
│   │   ├── TenantPermissionMiddleware.cs    # JWT → TenantId extraction
│   │   └── ErrorHandlerMiddleware.cs        # Global exception handling
│   │
│   ├── Properties/
│   │   └── launchSettings.json        # Launch configuration
│   │
│   └── bin/, obj/                     # Build outputs
│
├── kvk.BuildingBlocks/                # Shared Infrastructure
│   ├── kvk.BuildingBlocks.csproj
│   │
│   ├── Common/
│   │   ├── AuditableEntity.cs         # MERGED: BaseEntity + Audit (Id, TenantId, CreatedAt, CreatedBy, LastModifiedAt, LastModifiedBy)
│   │   ├── Result.cs                  # Standard API response wrapper
│   │   └── Enums/                     # Shared enums
│   │
│   ├── Interfaces/
│   │   ├── ITenantService.cs          # Tenant context management
│   │   ├── IModuleInitializer.cs      # Module registration contract
│   │   └── (Other shared interfaces)
│   │
│   ├── Services/
│   │   └── TenantService.cs           # Tenant context (AsyncLocal storage)
│   │
│   ├── Persistence/
│   │   └── AppDbContextBase.cs        # Base DbContext with global filters & SaveChanges override
│   │
│   └── bin/, obj/
│
├── kvk.Identity/                      # Identity & Authentication Module
│   ├── kvk.Identity.csproj
│   ├── IdentityModuleInitializer.cs   # Registers Identity services
│   │
│   ├── Domain/                        # Domain models
│   │   ├── User.cs                    # Extends AuditableEntity
│   │   ├── Role.cs                    # Extends AuditableEntity
│   │   └── UserRole.cs
│   │
│   ├── Persistence/
│   │   └── IdentityApplicationDbContext.cs
│   │
│   ├── Services/
│   │   ├── IUserService.cs
│   │   ├── UserService.cs
│   │   ├── IRoleService.cs
│   │   └── RoleService.cs
│   │
│   ├── Features/
│   │   ├── BaseIdentityModuleController.cs
│   │   │
│   │   └── Authentication/            # Feature folder
│   │       ├── LoginRequest.cs        # DTO
│   │       ├── LoginResponse.cs
│   │       ├── AuthenticationController.cs
│   │       └── AuthenticationService.cs
│   │
│   └── bin/, obj/
│
├── kvk.ModuleIntegrator/              # Module Discovery & Loading (Future)
│   ├── kvk.ModuleIntegrator.csproj
│   ├── Models/
│   │   └── ModuleInfo.cs
│   ├── Modules/
│   │   └── Identity/                  # Module metadata
│   └── bin/, obj/
│
└── (Future Business Modules - Same Pattern as kvk.Identity)
    ├── kvk.Gym/
    │   ├── GymModuleInitializer.cs
    │   ├── Domain/ (GymMember, MembershipPlan, etc.)
    │   ├── Persistence/
    │   ├── Services/
    │   ├── Features/
    │   │   ├── Members/
    │   │   ├── Memberships/
    │   │   ├── Attendance/
    │   │   └── ...
    │
    ├── kvk.CarWash/
    │   └── (Similar structure)
    │
    ├── kvk.Badminton/
    │   └── (Similar structure)
    │
    ├── kvk.Gaming/
    │   └── (Similar structure)
    │
    └── kvk.Retail/
        └── (Similar structure)
```

---

## Implementation Phases

### Phase 1: Core Architecture & Data Layer (Weeks 1-4)

**Objective**: Establish solid foundation for all future modules.

#### Week 1: Foundation Setup
- [ ] Remove `BaseEntity.cs` - Merge into `AuditableEntity`
- [ ] Update `AuditableEntity.cs` with merged structure (Id, TenantId, audit fields)
- [ ] Implement `IModuleInitializer` interface in BuildingBlocks
- [ ] Implement `ITenantService` & `TenantService` with AsyncLocal storage
- [ ] Implement `AppDbContextBase` with global query filters & SaveChanges override
- [ ] Implement `TenantPermissionMiddleware` for JWT → TenantId extraction
- [ ] Update `kvk.Host/Program.cs` with middleware pipeline
- [ ] Add NuGet packages (see Dependencies section)

#### Week 2: Identity Module Foundation
- [ ] Create domain models: `User`, `Role`, `UserRole` (all extend `AuditableEntity`)
- [ ] Create `IdentityApplicationDbContext`
- [ ] Implement `IdentityModuleInitializer`
- [ ] Create basic User & Role services (`IUserService`, `IRoleService`)
- [ ] Create database migrations (EF Core)
- [ ] Write integration tests for tenant isolation

#### Week 3: Authentication Flow
- [ ] Implement JWT token generation (claims include `TenantId`, `UserId`, `Role`)
- [ ] Create Authentication feature folder & `AuthenticationController`
- [ ] Implement login endpoint
- [ ] Add authentication tests

#### Week 4: Module Integration & Testing
- [ ] Update `Program.cs` to dynamically load `IdentityModuleInitializer`
- [ ] Create integration tests for:
  - Tenant isolation (verify data not leaking between tenants)
  - JWT validation in middleware
  - SaveChanges audit trail capture
  - Global query filters on all queries
- [ ] Load testing for database performance
- [ ] Documentation update: API endpoints available in Phase 1

### Phase 2: Gym Module (Weeks 5-8)
- [ ] Implement `GymModuleInitializer`, DbContext, domain models
- [ ] Features: Members, Memberships, Classes, Attendance
- [ ] Same testing & isolation guarantees as Phase 1

### Phase 3: CarWash Module (Weeks 9-12)
- [ ] Similar to Gym Module
- [ ] Features: Services, Bookings, Billing

### Phase 4: Badminton & Gaming Modules (Weeks 13-18)
- [ ] Repeat pattern

### Phase 5: Retail Module (Weeks 19-22)
- [ ] Repeat pattern

### Phase 6: Cross-Cutting Infrastructure (Weeks 23-26)
- [ ] Defer to future planning (RBAC, external services)

---

## Code Standards & Patterns

### 1. Entity Definition

**Rule**: All entities must inherit from `AuditableEntity`.

```csharp
public class GymMember : AuditableEntity
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    
    // TenantId, Id, CreatedAt, CreatedBy, LastModifiedAt, LastModifiedBy inherited
}
```

### 2. Repository Pattern

**Rule**: Always use repository/service layer. Never query DbContext directly from controllers.

```csharp
public interface IGymMemberRepository
{
    Task<GymMember> GetByIdAsync(Guid memberId);
    Task<IEnumerable<GymMember>> GetAllAsync();
    Task AddAsync(GymMember member);
    Task UpdateAsync(GymMember member);
    Task DeleteAsync(Guid memberId);
}
```

### 3. API Response Format

Use `Result<T>` for consistent responses:

```csharp
public class Result<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
    public List<string> Errors { get; set; }
}
```

---

## Dependencies & NuGet Packages

### Core Architecture Dependencies

**kvk.BuildingBlocks.csproj:**
```xml
<ItemGroup>
    <!-- ORM & Database -->
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.x" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.x" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.x" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Relational" Version="8.0.x" />
    
    <!-- PostgreSQL Provider -->
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.x" />
    
    <!-- ASP.NET Core -->
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Core" Version="2.3.x" />
    <PackageReference Include="Microsoft.AspNetCore.Http" Version="2.3.x" />
    
    <!-- Logging -->
    <PackageReference Include="Microsoft.Extensions.Logging" Version="8.0.x" />
    <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="8.0.x" />
    
    <!-- DI Container -->
    <PackageReference Include="Microsoft.Extensions.DependencyInjection" Version="8.0.x" />
    <PackageReference Include="Microsoft.Extensions.Configuration" Version="8.0.x" />
</ItemGroup>
```

**kvk.Host.csproj:**
```xml
<ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="8.0.x" />
    <PackageReference Include="Scalar.AspNetCore" Version="1.x" />
    
    <!-- JWT Authentication -->
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.x" />
    <PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.x" />
    
    <!-- CORS -->
    <PackageReference Include="Microsoft.AspNetCore.Cors" Version="2.3.x" />
</ItemGroup>
```

---

## Future Phases (Deferred)

The following are **explicitly deferred** to Phase 2+ and will be documented in separate architectural addenda:

- [ ] **RBAC Implementation** → BackendDocs/Identity/RBACSTAFF.MD
- [ ] **External Service Integration** → EXTERNAL_SERVICES.MD
- [ ] **Cross-Module Reporting** → REPORTING.MD
- [ ] **DevOps & Deployment** → DEPLOYMENT.MD

---

**Last Updated**: May 18, 2026  
**Status**: Architecture Finalized - Ready for Implementation  
**Next Step**: Begin Phase 1 Implementation

