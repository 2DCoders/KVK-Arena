# CODEWRITINGPLAN - kvk.Identity Feature Writing Pattern

## Goal
Use this document as a fast reference to build new feature folders inside `kvk.Identity/Features` using the same style as `Auth` and `Role`.

## Reference Features (Current Source of Truth)
- `kvk.Identity/Features/Auth`
  - `AuthController.cs`
  - `AuthService.cs`
  - `AuthRegisterRequest.cs`, `AuthLoginRequest.cs`, `AuthResponse.cs`
- `kvk.Identity/Features/Role`
  - `RoleController.cs`
  - `RoleService.cs`
  - `RoleCreateRequest.cs`, `RoleUpdateRequest.cs`, `RoleResponse.cs`

## Folder and File Naming Convention
Create one folder per feature:

```text
kvk.Identity/Features/{FeatureName}/
  {FeatureName}Controller.cs
  {FeatureName}Service.cs
  {FeatureName}CreateRequest.cs   (optional)
  {FeatureName}UpdateRequest.cs   (optional)
  {FeatureName}Response.cs
```

Guidelines:
- Namespace: `kvk.Identity.Features.{FeatureName}`
- Class names use singular feature name (`RoleService`, `AuthService`)
- Keep DTOs in the same feature folder unless shared by multiple features
- Keep endpoint routes under `api/identity-m/{segment}`

## Responsibility Split
- Controller
  - HTTP contract only
  - Calls service methods
  - Converts `Result` to HTTP status codes
  - No data access logic
- Service
  - Validation and business logic
  - EF Core queries/commands via `IdentityApplicationDbContext`
  - Returns `Result` for success/failure flows
  - Maps entity to response DTO
- Request DTO
  - Input payload from API clients
- Response DTO
  - Output shape returned to clients

## Result Pattern (Must Follow)
Use `kvk.BuildingBlocks.Common.Result` consistently:

- Success:
  - `Result.Success()` or `Result.Success("message")`
  - Attach payload with `.WithData("response", responseDtoOrArray)`
- Failure:
  - `Result.Failure("message")`
  - Use early-return validation failures

Typical controller handling:
- `BadRequest(result)` when `!result.Succeeded`
- `NotFound(result)` when entity does not exist
- `CreatedAtAction(...)` for create endpoints when response contains an id
- `Ok(result)` for successful reads/updates/deletes

## Validation and Error Handling Style
Follow the style already used in `AuthService` and `RoleService`:
- Null/empty checks first (early returns)
- Domain rules next (length, uniqueness, relation constraints)
- Try/catch around DB work and return `Result.Failure(...)` with context message
- For expected read-only queries use `.AsNoTracking()`

Note:
- `ErrorHandlerMiddleware` already handles thrown exceptions globally.
- Prefer returning `Result.Failure(...)` for expected business failures.

## DI Registration Checklist
After creating a new `XxxService`, register it in `kvk.Identity/IdentityModuleInitializer.cs`:

```csharp
services.AddScoped<XxxService>();
```

If the feature introduces new interfaces, repositories, or helper services, register those too.

## Quick Implementation Checklist (Copy and Use)
- [ ] Create folder: `kvk.Identity/Features/{FeatureName}`
- [ ] Add request DTO(s)
- [ ] Add response DTO
- [ ] Add service with validations + EF Core operations + mapping
- [ ] Add controller routes and status handling
- [ ] Register service in `IdentityModuleInitializer`
- [ ] Add or update DbSet/entity configuration if required
- [ ] Verify routes and response shape from Swagger/OpenAPI

## Copy-Ready Skeletons

### 1) Request DTO
```csharp
namespace kvk.Identity.Features.{FeatureName};

public class {FeatureName}CreateRequest
{
    public string Name { get; set; } = string.Empty;
}
```

### 2) Response DTO
```csharp
namespace kvk.Identity.Features.{FeatureName};

public class {FeatureName}Response
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime LastModifiedAt { get; set; }
}
```

### 3) Service
```csharp
using kvk.BuildingBlocks.Common;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace kvk.Identity.Features.{FeatureName};

public class {FeatureName}Service
{
    private readonly IdentityApplicationDbContext _db;

    public {FeatureName}Service(IdentityApplicationDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync({FeatureName}CreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required");

        try
        {
            // TODO: replace ExampleEntity with your domain entity
            var entity = new ExampleEntity
            {
                Name = request.Name
            };

            _db.Set<ExampleEntity>().Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new {FeatureName}Response
            {
                Id = entity.Id,
                Name = entity.Name,
                CreatedAt = entity.CreatedAt,
                LastModifiedAt = entity.LastModifiedAt
            };

            return Result.Success("Created successfully")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create: {ex.Message}");
        }
    }

    public async Task<Result> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var entity = await _db.Set<ExampleEntity>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (entity == null)
                return Result.Failure("Not found");

            var response = new {FeatureName}Response
            {
                Id = entity.Id,
                Name = entity.Name,
                CreatedAt = entity.CreatedAt,
                LastModifiedAt = entity.LastModifiedAt
            };

            return Result.Success().WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to fetch: {ex.Message}");
        }
    }
}
```

### 4) Controller
```csharp
using Microsoft.AspNetCore.Mvc;

namespace kvk.Identity.Features.{FeatureName};

[ApiController]
[Route("api/identity-m/{route-segment}")]
public class {FeatureName}Controller : ControllerBase
{
    private readonly {FeatureName}Service _service;

    public {FeatureName}Controller({FeatureName}Service service)
    {
        _service = service ?? throw new ArgumentNullException(nameof(service));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] {FeatureName}CreateRequest request, CancellationToken cancellationToken = default)
    {
        var result = await _service.CreateAsync(request, cancellationToken);

        if (!result.Succeeded)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken = default)
    {
        var result = await _service.GetByIdAsync(id, cancellationToken);

        if (!result.Succeeded)
            return NotFound(result);

        return Ok(result);
    }
}
```

## Route Pattern Examples
- `api/identity-m/auth/client/register`
- `api/identity-m/auth/client/login`
- `api/identity-m/roles`

Use plural route segments for resource collections (`roles`, `staff`, `permissions`).

## Final Review Before Merge
- [ ] Service registered in DI
- [ ] No controller-level EF Core usage
- [ ] All service methods return `Result`
- [ ] `WithData("response", ...)` used for payloads
- [ ] Status codes mapped consistently in controller
- [ ] No hardcoded magic values without constants (except simple route literals)
- [ ] Swagger shows expected request/response contracts

---

Last updated: 2026-05-19

