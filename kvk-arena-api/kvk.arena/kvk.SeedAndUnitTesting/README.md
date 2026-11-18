# Application permission seed endpoints

| Module | POST endpoint | Permission count | Permission grid |
| --- | --- | --- | --- |
| Gym | `/api/seed/application-permissions/gym` | 30 | [Gym](../BackendDocs/Identity/GymApplicationPermissions.Md) |
| Badminton | `/api/seed/application-permissions/badminton` | 19 | [Badminton](../BackendDocs/Identity/BadmintonApplicationPermissions.Md) |
| Gaming | `/api/seed/application-permissions/gaming` | 34 | [Gaming](../BackendDocs/Identity/GamingApplicationPermissions.Md) |
| Cafe | `/api/seed/application-permissions/cafe` | 12 | [Cafe](../BackendDocs/Identity/CafeApplicationPermissions.Md) |
| Saloon | `/api/seed/application-permissions/saloon` | 24 | [Saloon](../BackendDocs/Identity/SaloonApplicationPermissions.Md) |
| Financial | `/api/seed/application-permissions/financial` | 6 | [Financial](../BackendDocs/Identity/FinancialApplicationPermissions.Md) |

The new Gaming, Cafe, Saloon, and Financial seed endpoints require a valid staff Bearer token, an active staff record, and an active assignment to the active role named exactly `Admin`. No request body is required. Each inserts only missing permission codes and preserves existing entries, including inactive ones. Responses contain `total`, `inserted`, `skipped`, and `insertedCodes`; concurrent duplicate insertion returns HTTP 409 and can be retried.

All controllers in this project are discovered through the seed assembly already registered in the API host. Seeding registers application permissions only; assign role permissions separately. Provider callbacks remain outside staff RBAC. Financial analytics are proposed for Admin only; the three operational modules' grids document their Cashier/Admin grants.

## Gym application permission seed

Send `POST /api/seed/application-permissions/gym` with a valid staff Bearer token. No request body is required. The caller must have an active staff record (`Status = Active`) and an active assignment to the active role named exactly `Admin`.

This bootstrap endpoint checks the existing Admin role in the database, so it can register permission codes before role permissions have been configured. It does not create an Admin role or assign roles to staff.

The endpoint inserts the 30 codes listed in [GymApplicationPermissions.Md](../BackendDocs/Identity/GymApplicationPermissions.Md) into Identity's `ApplicationPermissions` table with descriptions and `IsActive = true`. Existing codes are skipped, including inactive entries; their descriptions, status, and audit fields are preserved. Repeated requests insert zero records after the first successful seed. Concurrent duplicate inserts return HTTP 409; retry the request to skip the newly existing records.

Example first-run response:

```json
{
  "total": 30,
  "inserted": 30,
  "skipped": 0,
  "insertedCodes": ["KVK:Gym:Attendance:Create", "..."]
}
```

After seeding, assign the required codes to Cashier/Admin roles using the existing Identity role-permission endpoints. Seeding alone does not grant access. Gym staff endpoints enforce `AuthorizeByPermission`; member login, member password changes, and payment notifications remain outside staff RBAC.

## Badminton application permission seed

Send `POST /api/seed/application-permissions/badminton` with a valid staff Bearer token and no request body. The caller must be an active staff member with an active assignment to the active role named exactly `Admin`.

This endpoint registers the **19 Badminton permission codes** from [BadmintonApplicationPermissions.Md](../BackendDocs/Identity/BadmintonApplicationPermissions.Md). It follows the same insert-missing behavior and response structure as the Gym seed: existing entries, including inactive ones, remain unchanged; repeated calls skip previously registered codes. Concurrent duplicate insertion returns HTTP 409 and can be retried.

Assign the documented Cashier/Admin role permissions separately. The 26 Badminton staff actions enforce `AuthorizeByPermission`; the signed payment-provider notification remains outside staff RBAC. Both seed controllers are discovered through the seed assembly already registered in the API host.
