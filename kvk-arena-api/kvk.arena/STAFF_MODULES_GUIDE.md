# Staff Modules & Module Seeding Guide

This guide explains how to use the staff module seeding system in KVK Arena and manage staff access to application modules.

## Overview

The staff module system allows administrators to:
- Assign one or more modules (Gym, CarWash, BadmintonCourt, GamingCenter, Retail) to staff members
- Retrieve which modules a staff member can access
- Revoke module access when needed
- Query available modules in the system

Staff module assignments are returned in the login response under the `modules` array, enabling the UI to show which features are available to each authenticated user.

## Module Names

Five modules are currently supported:

```csharp
ModuleConstants.Gym              // "Gym"
ModuleConstants.CarWash          // "CarWash"
ModuleConstants.BadmintonCourt   // "BadmintonCourt"
ModuleConstants.GamingCenter     // "GamingCenter"
ModuleConstants.Retail           // "Retail"
```

These constants are defined in `kvk.BuildingBlocks/Common/ModuleConstants.cs` for easy reference across all modules.

## Architecture

### Components

1. **ModuleConstants** (`kvk.BuildingBlocks/Common/ModuleConstants.cs`)
   - Centralized module name constants
   - Accessible from any module in the system

2. **StaffModule** Entity (`kvk.Identity/Domain/StaffModule.cs`)
   - Represents staff-to-module assignment
   - Fields: `Id`, `StaffId`, `ModuleName`, `IsActive`, audit fields

3. **IdentitySeeder** (`kvk.Identity/Services/IdentitySeeder.cs`)
   - Core seeding service
   - Handles module assignment and revocation
   - Used internally by service layer

4. **StaffModuleService** (`kvk.Identity/Features/StaffModule/StaffModuleService.cs`)
   - Business logic for module management
   - Validation and error handling
   - Used by controllers and other services

5. **StaffModuleController** (`kvk.Identity/Features/StaffModule/StaffModuleController.cs`)
   - REST API endpoints for module management
   - Admin assignment/revocation operations

6. **AuthService** (Updated)
   - Now loads staff modules during login
   - Returns `modules` array in `AuthResponse`

## API Endpoints

### Get Available Modules

```
GET /api/identity-m/staff/{staffId}/modules/available
```

**Response:**
```json
{
  "availableModules": ["Gym", "CarWash", "BadmintonCourt", "GamingCenter", "Retail"]
}
```

### Get Staff Modules

```
GET /api/identity-m/staff/{staffId}/modules
```

**Response:**
```json
{
  "staffId": "550e8400-e29b-41d4-a716-446655440000",
  "assignedModules": ["Gym", "Retail"],
  "lastModified": "2026-05-19T18:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Staff member does not exist
- `400 Bad Request`: Invalid staff ID provided

### Assign Modules to Staff

```
POST /api/identity-m/staff/{staffId}/modules/assign
```

**Request Body:**
```json
{
  "staffId": "550e8400-e29b-41d4-a716-446655440000",
  "moduleNames": ["Gym", "CarWash", "Retail"]
}
```

**Response:**
```json
{
  "staffId": "550e8400-e29b-41d4-a716-446655440000",
  "assignedModules": ["Gym", "CarWash", "Retail"],
  "lastModified": "2026-05-19T18:30:00Z"
}
```

**Validation:**
- Duplicate assignments are idempotent (no error if already assigned)
- Invalid module names return `400 Bad Request` with available modules list
- Non-existent staff returns `404 Not Found`

### Revoke Module from Staff

```
DELETE /api/identity-m/staff/{staffId}/modules/{moduleName}
```

**Example:**
```
DELETE /api/identity-m/staff/550e8400-e29b-41d4-a716-446655440000/modules/Gym
```

**Response:**
```json
{
  "staffId": "550e8400-e29b-41d4-a716-446655440000",
  "assignedModules": ["CarWash", "Retail"],
  "lastModified": "2026-05-19T18:30:05Z"
}
```

## Login Response

When a staff member logs in, their assigned modules are returned:

```
POST /api/identity-m/auth/staff/login
```

**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "token": "eyJhbGc...",
  "permissions": ["KVK:Gym:Category:View", "KVK:Retail:Product:Edit"],
  "modules": ["Gym", "Retail"],
  "email": "admin@kvkarena.com",
  "userName": "admin",
  "firstName": "Admin",
  "lastName": "User"
}
```

The `modules` array tells the frontend which features to render/enable for this user.

## Usage Examples

### .NET/C# Usage

#### Programmatically Assign Modules

```csharp
// Inject IdentitySeeder or StaffModuleService
private readonly StaffModuleService _moduleService;

public async Task SetupStaffAsync(Guid staffId)
{
    var modules = new[] { 
        ModuleConstants.Gym, 
        ModuleConstants.CarWash 
    };
    
    var result = await _moduleService.AssignModulesToStaffAsync(
        staffId, 
        modules,
        cancellationToken: CancellationToken.None
    );
    
    Console.WriteLine($"Assigned {result.AssignedModules.Length} modules");
}
```

#### Using IdentitySeeder Directly

```csharp
private readonly IdentitySeeder _seeder;

public async Task AssignModuleAsync(Guid staffId, string moduleName)
{
    var success = await _seeder.AssignModuleToStaffAsync(staffId, moduleName);
    if (success)
        Console.WriteLine($"Module {moduleName} assigned successfully");
}

public async Task RevealStaffModulesAsync(Guid staffId)
{
    var modules = await _seeder.GetStaffModulesAsync(staffId);
    foreach (var module in modules)
        Console.WriteLine($"- {module}");
}
```

### HTTP Client Usage

#### Using cURL

**Assign modules:**
```bash
curl -X POST https://localhost:5001/api/identity-m/staff/550e8400-e29b-41d4-a716-446655440000/modules/assign \
  -H "Content-Type: application/json" \
  -d '{
    "staffId": "550e8400-e29b-41d4-a716-446655440000",
    "moduleNames": ["Gym", "CarWash", "Retail"]
  }'
```

**Get assigned modules:**
```bash
curl https://localhost:5001/api/identity-m/staff/550e8400-e29b-41d4-a716-446655440000/modules
```

**Revoke a module:**
```bash
curl -X DELETE https://localhost:5001/api/identity-m/staff/550e8400-e29b-41d4-a716-446655440000/modules/Gym
```

#### Using JavaScript/TypeScript

```typescript
// Assign modules to staff
async function assignModules(staffId: string, modules: string[]) {
  const response = await fetch(
    `https://localhost:5001/api/identity-m/staff/${staffId}/modules/assign`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffId,
        moduleNames: modules
      })
    }
  );
  return response.json();
}

// Get available modules
async function getAvailableModules(staffId: string) {
  const response = await fetch(
    `https://localhost:5001/api/identity-m/staff/${staffId}/modules/available`
  );
  return response.json();
}

// Usage
const staffId = '550e8400-e29b-41d4-a716-446655440000';
await assignModules(staffId, ['Gym', 'Retail']);
const assigned = await fetch(
  `https://localhost:5001/api/identity-m/staff/${staffId}/modules`
).then(r => r.json());
console.log(assigned.assignedModules); // ["Gym", "Retail"]
```

## Database Schema

The `StaffModules` table stores the staff-to-module assignments:

```sql
CREATE TABLE "identity"."StaffModules" (
    "Id" uuid NOT NULL,
    "StaffId" uuid NOT NULL,
    "ModuleName" character varying(100) NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "TenantId" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "CreatedBy" uuid NOT NULL,
    "LastModifiedAt" timestamp with time zone NOT NULL,
    "LastModifiedBy" uuid,
    PRIMARY KEY ("Id"),
    UNIQUE ("StaffId", "ModuleName"),
    FOREIGN KEY ("StaffId") REFERENCES "Staff" ("Id") ON DELETE CASCADE
);
```

**Key Features:**
- `StaffId` + `ModuleName` unique constraint ensures one assignment per staff/module pair
- `IsActive` flag allows soft-disabling assignments
- Cascade delete ensures cleanup when a staff member is removed
- Audit fields for tracking who made changes and when

## Seeding During Application Startup

To ensure modules are set up automatically during app initialization, you can call the seeder in `Program.cs`:

```csharp
// In kvk.Host/Program.cs, after app.Build():

using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<IdentitySeeder>();
    await seeder.SeedDefaultModulesAsync();
    
    // Optionally assign modules to test staff
    // await seeder.AssignModuleToStaffAsync(staffIdGuid, ModuleConstants.Gym);
}

await app.RunAsync();
```

## Migration Details

The `StaffModules` table was added via EF Core migration:

**Migration File:** `20260519183000_AddStaffModules.cs`

**Applied:**
- Creates `StaffModules` table in the `identity` schema
- Adds unique constraint on `(StaffId, ModuleName)`
- Creates indexes for query optimization
- Registers foreign key relationship to `Staff`

**Run Migrations:**
```bash
dotnet ef database update --project kvk.Identity
```

## Best Practices

1. **Always validate module names** before assignment
   - Use `ModuleConstants` for type-safe references
   - Fall back to HTTP endpoint for available modules list

2. **Keep assignments idempotent**
   - Assigning the same module twice should not error
   - Service handles duplicate prevention automatically

3. **Handle audit trails**
   - `CreatedBy` and `LastModifiedBy` track who made changes
   - Use this for admin audit logging

4. **Consider permissions separately**
   - Module assignments are **not** the same as endpoint permissions
   - `Modules` = which features are accessible
   - `Permissions` = which actions within features are allowed

5. **UI should use modules for feature gates**
   - Check `modules` array from login response in frontend
   - Show/hide module-specific UI based on assignments
   - Do NOT rely on frontend filtering alone (always validate on backend)

## Troubleshooting

### Staff member has no modules after assignment

- Verify the staff member exists in the database
- Check that module name matches exactly (case-sensitive: "Gym", not "gym")
- Confirm the `StaffModule` record was inserted (check database directly)

### Login returns empty modules array

- Staff member may not have any assignments
- Check `StaffModules` table for records with matching `StaffId`
- Verify `IsActive` is `true` for those assignments

### API returns 404 for available modules

- Ensure staff ID is valid (UUID format)
- Staff member must exist in the `Staff` table

### Duplicate module assignment error

- Service prevents true duplicates (unique constraint)
- If you see duplicate entries, check for race conditions in concurrent requests

## Next Steps

1. **Add admin UI** for staff module management (optional)
2. **Audit logging** for module assignment changes
3. **Role-based module defaults** (automatically assign modules based on role)
4. **Module feature flags** (conditional module availability)

