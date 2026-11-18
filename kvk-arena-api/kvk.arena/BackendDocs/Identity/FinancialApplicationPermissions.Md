# Financial Application Permissions

Date: 2026-10-03 | Status: Endpoint checks implemented; role assignments proposed

## Scope and naming

Reviewed **6 active controllers and 6 endpoints** in `kvk.Financial`. **6 staff endpoints** require `AuthorizeByPermission`.

Follow [RBACSTAFF.MD](RBACSTAFF.MD), section 5: exact, case-sensitive `KVK:{Module}:{Entity}:{Action}` with module `Financial` and supported actions `View`, `Create`, `Edit`, `Delete`, `Manage`. Business actions determine names rather than HTTP verbs. Activate/deactivate use Manage; availability checks use View; payment confirmation uses Edit; pending-payment cancellation uses Delete.

Cashier/Admin assignments are proposals inferred from endpoint behavior, not existing database grants. All financial analytics are proposed for Admin only; Cashier receives no Financial permissions by default. Analytics for other businesses still use the Financial permission module because these controllers belong to kvk.Financial. Endpoint authorization checks active role permissions rather than role names.

Baseline before this change: active controllers declared no staff permission attributes. The shared filter challenges unauthenticated requests and forbids requests without the required active permission.

## Endpoint grid

Routes below preserve controller prefixes, GUID constraints, and absolute action-route overrides. Actions sharing a business operation reuse the same code.

### BadmintonAnalytics

Source: [BadmintonAnalyticsController.cs](../../kvk.Financial/Features/BadmintonAnalytics/BadmintonAnalyticsController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/financial/badminton-analytics` | `Get` | `KVK:Financial:BadmintonAnalytics:View` | No | Yes | View Badminton financial analytics for the requested date range. |

### CafeAnalytics

Source: [CafeAnalyticsController.cs](../../kvk.Financial/Features/CafeAnalytics/CafeAnalyticsController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/financial/cafe-analytics` | `Get` | `KVK:Financial:CafeAnalytics:View` | No | Yes | View Cafe financial analytics for the requested date range. |

### CarServiceAnalytics

Source: [CarServiceAnalyticsController.cs](../../kvk.Financial/Features/CarserviceAnalytics/CarServiceAnalyticsController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/financial/car-service-analytics` | `Get` | `KVK:Financial:CarServiceAnalytics:View` | No | Yes | View CarService financial analytics for the requested date range. |

### GamingAnalytics

Source: [GamingAnalyticsController.cs](../../kvk.Financial/Features/GamingAnalytics/GamingAnalyticsController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/financial/gaming-analytics` | `Get` | `KVK:Financial:GamingAnalytics:View` | No | Yes | View Gaming financial analytics for the requested date range. |

### GymAnalytics

Source: [GymAnalyticsController.cs](../../kvk.Financial/Features/GymAnalytics/GymAnalyticsController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/financial/gym-analytics` | `Get` | `KVK:Financial:GymAnalytics:View` | No | Yes | View Gym financial analytics for the requested date range. |

### SaloonAnalytics

Source: [SaloonAnalyticsController.cs](../../kvk.Financial/Features/SaloonAnalytics/SaloonAnalyticsController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/financial/saloon-analytics` | `Get` | `KVK:Financial:SaloonAnalytics:View` | No | Yes | View Saloon financial analytics for the requested date range. |

## Unique permission creation grid

Register these **6 unique codes** in Identity's `ApplicationPermissions` table before assigning them through active role permissions. Users receive permissions through roles, never directly.

| Permission code | Cashier | Admin |
| --- | --- | --- |
| `KVK:Financial:BadmintonAnalytics:View` | No | Yes |
| `KVK:Financial:CafeAnalytics:View` | No | Yes |
| `KVK:Financial:CarServiceAnalytics:View` | No | Yes |
| `KVK:Financial:GamingAnalytics:View` | No | Yes |
| `KVK:Financial:GymAnalytics:View` | No | Yes |
| `KVK:Financial:SaloonAnalytics:View` | No | Yes |

Cashier: **0** unique permissions. Admin: **6** unique permissions.

## Seed endpoint

Call `POST /api/seed/application-permissions/financial` with a valid staff Bearer token and no request body. The caller must be an active staff member (`Status = Active`) with an active assignment to the active role named exactly `Admin`.

The seed inserts missing codes with descriptions and `IsActive = true`, skips existing codes (including inactive entries), and returns `total`, `inserted`, `skipped`, and `insertedCodes`. Existing descriptions, status, and audit fields are preserved. Repeated requests insert zero entries once every code exists. Concurrent duplicate insertion returns HTTP 409; retry to skip the newly existing records.

Seeding registers application permissions only; assign the documented role permissions separately through existing Identity endpoints.

Source: [FinancialApplicationPermissionsSeedController.cs](../../kvk.SeedAndUnitTesting/Features/ApplicationPermissions/FinancialApplicationPermissionsSeedController.cs).

## Workflow boundaries

Endpoint permissions do not change service business rules, existing routes, query parameters, or record ownership. A lookup permission covers all query variants exposed by its action. Any customer/member self-service needs its own authorization model, separate from central staff RBAC.

- The six independent analytics grants cover Gym, Badminton, Gaming, Cafe, CarService, and Saloon. No Create/Edit/Delete/Manage permissions are invented for this read-only module.
- Financial access does not follow automatically from an operational business permission; the caller needs the matching `KVK:Financial:{Business}Analytics:View` grant.
- Date range validation and report calculations remain in the existing actions/services.

