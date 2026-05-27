# KVK Arena - Staff RBAC Specification

**Version 0.1** | **Date**: May 18, 2026 | **Status**: Draft for Implementation

---

## 1. Purpose

This document defines the **staff-only RBAC system** for KVK Arena.

Phase 1 covers:
- staff identity
- roles
- permission codes
- role-to-permission mapping
- endpoint authorization via a reusable permission attribute

This document does **not** define member/customer authentication for modules. Module-owned member auth will be documented separately per module when needed.

---

## 2. Scope

### In scope
- Shared `User` base model in `kvk.BuildingBlocks`
- Staff identity model in `kvk.Identity`
- Permission code standard
- EF Core entities and mappings for staff RBAC
- Authorization attribute and shared authorization logic in `kvk.BuildingBlocks/Auth`
- 403 enforcement when permission is missing

### Out of scope
- Member registration for modules
- Member login flows
- Module-specific customer portals
- External identity providers
- Tenant resolution changes

---

## 3. Design Decision: Shared `User` Base

`User` should be a shared base class in `kvk.BuildingBlocks` and can be extended by both:
- staff users in `kvk.Identity`
- module-specific member users in future module projects

This keeps identity behavior reusable while allowing modules to opt into member accounts only when they actually need them.

### Why this is the preferred approach
- avoids duplicating common identity fields
- keeps staff and module member models consistent
- allows modules with no members to stay simple
- prevents the shared identity layer from becoming module-specific

### Shared base recommendation
The shared base should contain only generic identity fields, such as:
- `Id`
- `Email`
- `Phone`
- `PasswordHash`
- `Status`
- auditable fields

Staff and module member profiles can add their own domain-specific fields later.

---

## 4. Staff-Only Phase Boundary

For this phase, RBAC is for **staff only**.

### Rules
- Only staff users are granted roles in the central Identity module
- Users never receive permissions directly
- Permissions are assigned only through roles
- Module member auth is not part of this phase
- Modules without members do not need any member tables at all

### Important note
This means a module like Car Wash may have no member registration concept at all and should still work normally with staff authorization only.

---

## 5. Permission Code Standard

All permissions are stored as a single string code.

### Mandatory format
`KVK:{Module}:{Entity}:{Action}`

### Example codes
- `KVK:Gym:Category:View`
- `KVK:Gym:Category:Manage`
- `KVK:CarWash:Order:Create`
- `KVK:Gym:DayEnd:Create`

### Supported actions
- `View`
- `Create`
- `Edit`
- `Delete`
- `Manage`

### Rules
- permission codes are case-sensitive and must follow the exact format
- module, entity, and action are encoded inside the string only
- there are no separate module/entity/action columns in the database
- the permission code must exist in `application_permissions` before it can be assigned

---

## 6. Authorization Data Model

All tables below belong to the Identity persistence boundary.

### 6.1 `staff`
Represents staff users.

Fields:
- `id` (uuid)
- `email`
- `phone`
- `password_hash`
- `status`
- auditable fields (`created_at`, `updated_at`, etc.)

### 6.2 `application_permissions`
Stores every valid permission code in the system.

Fields:
- `id` (uuid)
- `code` (unique)

Rules:
- this is the source of truth for all allowed permissions
- only codes present here may be used in role permissions

### 6.3 `roles`
Represents staff roles.

Fields:
- `id` (uuid)
- `name`
- `description`
- `is_active`

### 6.4 `role_permissions`
Stores which permission codes belong to which role.

Fields:
- `role_id` (uuid)
- `code` (permission string)
- `is_active`

Rules:
- the code must already exist in `application_permissions`
- do not store module/entity/action columns here
- only the encoded permission string is stored

### 6.5 User-to-role assignment
Staff users are assigned roles through a join table or equivalent relationship.

Rules:
- users can have one or more roles, depending on the final product decision
- users never receive permissions directly
- permissions are derived from active role permissions only

---

## 7. Reusable Authorization Attribute

Authorization must be enforced with a shared attribute from `kvk.BuildingBlocks/Auth`.

### Attribute example
```csharp
[AuthorizeByPermission("KVK:Gym:DayEnd:Create")]
public async Task<DayEndResponse> CreateAsync(...)
```

### Attribute responsibilities
1. read the current user identity
2. resolve the user roles
3. load active permissions for those roles
4. check whether the required permission code exists
5. return `403 Forbidden` when access is denied

### Reuse rule
The attribute must be reusable across all modules, not only Identity.

---

## 8. Request Authorization Flow

### Flow
1. request reaches the API with a valid authenticated staff user
2. current user id is resolved from claims
3. user roles are loaded
4. all active permissions for those roles are collected
5. the endpoint-specific permission is compared against the collected permissions
6. if the permission exists, the request continues
7. if not, the request is rejected with `403 Forbidden`

### Important rule
Authorization does **not** check module separately.
The permission string already contains the module name.

---

## 9. Shared Auth Placement

The reusable authorization logic should live in `kvk.BuildingBlocks/Auth`.

Recommended contents:
- `AuthorizeByPermissionAttribute`
- permission authorization handler
- permission requirement model if needed
- helper services for permission lookup and evaluation

### Why shared auth belongs here
- it is cross-cutting infrastructure
- it can be used by every module
- it avoids duplication
- it keeps the authorization contract consistent

---

## 10. Future Boundary: Module-Owned Member Auth

This document intentionally leaves module member auth out of scope.

### Future rule
If a module needs member accounts, that module owns:
- member registration
- member login
- member profile model
- member-specific authorization rules
- member-specific tables and lifecycle

### Example
- Gym may later define its own member auth flow
- Car Wash may never need member auth at all
- both cases should remain valid without changing staff RBAC

---

## 11. Implementation Requirements for Phase 1

### EF Core
Create:
- entity classes
- fluent configurations
- identity DbContext
- relationships and unique constraints

### Repository/service methods
Implement:
- `GetUserPermissions(userId)`
- `HasPermission(userId, permissionCode)`

### Authorization
Implement:
- `AuthorizeByPermissionAttribute`
- authorization handler or middleware logic
- 403 response behavior

### Validation rules
- reject permission codes not found in `application_permissions`
- reject access when role permissions are inactive
- reject access when the user has no matching permission

---

## 12. Key Rules and Invariants

1. permissions are stored only as encoded strings
2. permission format must always be `KVK:{Module}:{Entity}:{Action}`
3. users never get permissions directly
4. roles are the only bridge between users and permissions
5. only permission codes that exist in `application_permissions` can be assigned
6. authorization is reusable and shared through `kvk.BuildingBlocks/Auth`
7. module member auth is separate and optional
8. modules without members do not need member tables

---

## 13. Next Step

After this document is approved, implementation can begin with:
1. shared `User` base placement in `kvk.BuildingBlocks`
2. staff RBAC entities in `kvk.Identity`
3. shared permission authorization in `kvk.BuildingBlocks/Auth`
4. EF Core configuration and service methods
5. endpoint usage of `AuthorizeByPermissionAttribute`

