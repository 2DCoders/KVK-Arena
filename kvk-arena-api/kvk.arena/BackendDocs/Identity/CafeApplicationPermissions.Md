# Cafe Application Permissions

Date: 2026-10-03 | Status: Endpoint checks implemented; role assignments proposed

## Scope and naming

Reviewed **4 active controllers and 16 endpoints** in `kvk.Cafe`. **15 staff endpoints** require `AuthorizeByPermission`. The **1 payment-provider callback** remains outside staff RBAC.

Follow [RBACSTAFF.MD](RBACSTAFF.MD), section 5: exact, case-sensitive `KVK:{Module}:{Entity}:{Action}` with module `Cafe` and supported actions `View`, `Create`, `Edit`, `Delete`, `Manage`. Business actions determine names rather than HTTP verbs. Activate/deactivate use Manage; availability checks use View; payment confirmation uses Edit; pending-payment cancellation uses Delete.

Cashier/Admin assignments are proposals inferred from endpoint behavior, not existing database grants. Cashier receives daily operational access and relevant lookup permissions. Admin receives all listed codes, including configuration and administration. Permanent booking/order deletion, where present, is reserved for Admin. Endpoint authorization checks active role permissions rather than role names.

Baseline before this change: active controllers declared no staff permission attributes. The shared filter challenges unauthenticated requests and forbids requests without the required active permission.

## Endpoint grid

Routes below preserve controller prefixes, GUID constraints, and absolute action-route overrides. Actions sharing a business operation reuse the same code.

### DayEnd

Source: [DayEndController.cs](../../kvk.Cafe/Features/DayEnd/DayEndController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/cafe/dayend` | `Create` | `KVK:Cafe:DayEnd:Create` | Yes | Yes | Create DayEnd records. |
| GET | `/api/cafe/dayend` | `Get` | `KVK:Cafe:DayEnd:View` | Yes | Yes | View DayEnd records. |

### Menu

Source: [MenuController.cs](../../kvk.Cafe/Features/Menu/MenuController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/cafe/menu` | `Create` | `KVK:Cafe:Menu:Create` | No | Yes | Create Menu records. |
| PUT | `/api/cafe/menu` | `Update` | `KVK:Cafe:Menu:Edit` | No | Yes | Edit Menu records. |
| DELETE | `/api/cafe/menu/{id:guid}` | `Delete` | `KVK:Cafe:Menu:Delete` | No | Yes | Delete Menu records. |
| GET | `/api/cafe/menu` | `Get` | `KVK:Cafe:Menu:View` | Yes | Yes | View Menu records. |
| GET | `/api/cafe/menu/{id:guid}` | `GetById` | `KVK:Cafe:Menu:View` | Yes | Yes | View Menu records. |
| GET | `/api/cafe/menu/category/{category}` | `GetByCategory` | `KVK:Cafe:Menu:View` | Yes | Yes | View Menu records. |

### Order

Source: [OrderController.cs](../../kvk.Cafe/Features/Order/OrderController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/cafe/order` | `Create` | `KVK:Cafe:Order:Create` | Yes | Yes | Create Order records. |
| PUT | `/api/cafe/order` | `Update` | `KVK:Cafe:Order:Edit` | Yes | Yes | Edit Order records. |
| DELETE | `/api/cafe/order/{id:guid}` | `Delete` | `KVK:Cafe:Order:Delete` | No | Yes | Delete Order records. |
| GET | `/api/cafe/order` | `Get` | `KVK:Cafe:Order:View` | Yes | Yes | View Order records. |
| GET | `/api/cafe/order/{id:guid}` | `GetById` | `KVK:Cafe:Order:View` | Yes | Yes | View Order records. |

### CafePaymentGateway

Source: [CafePaymentGatewayController.cs](../../kvk.Cafe/Features/PaymentGateway/CafePaymentGatewayController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/payments/cafe/create` | `CreatePayment` | `KVK:Cafe:PaymentGateway:Create` | Yes | Yes | Initiate a Cafe gateway payment. |
| POST | `/api/payments/cafe/reverse` | `DeletePendingPayment` | `KVK:Cafe:PaymentGateway:Delete` | Yes | Yes | Cancel pending Cafe gateway payment. |
| POST | `/api/payments/cafe/notify` | `PaymentNotification` | None - provider callback | N/A | N/A | Payment-provider notification; service verifies the signature. |

## Unique permission creation grid

Register these **12 unique codes** in Identity's `ApplicationPermissions` table before assigning them through active role permissions. Users receive permissions through roles, never directly.

| Permission code | Cashier | Admin |
| --- | --- | --- |
| `KVK:Cafe:DayEnd:Create` | Yes | Yes |
| `KVK:Cafe:DayEnd:View` | Yes | Yes |
| `KVK:Cafe:Menu:Create` | No | Yes |
| `KVK:Cafe:Menu:Edit` | No | Yes |
| `KVK:Cafe:Menu:Delete` | No | Yes |
| `KVK:Cafe:Menu:View` | Yes | Yes |
| `KVK:Cafe:Order:Create` | Yes | Yes |
| `KVK:Cafe:Order:Edit` | Yes | Yes |
| `KVK:Cafe:Order:Delete` | No | Yes |
| `KVK:Cafe:Order:View` | Yes | Yes |
| `KVK:Cafe:PaymentGateway:Create` | Yes | Yes |
| `KVK:Cafe:PaymentGateway:Delete` | Yes | Yes |

Cashier: **8** unique permissions. Admin: **12** unique permissions.

## Seed endpoint

Call `POST /api/seed/application-permissions/cafe` with a valid staff Bearer token and no request body. The caller must be an active staff member (`Status = Active`) with an active assignment to the active role named exactly `Admin`.

The seed inserts missing codes with descriptions and `IsActive = true`, skips existing codes (including inactive entries), and returns `total`, `inserted`, `skipped`, and `insertedCodes`. Existing descriptions, status, and audit fields are preserved. Repeated requests insert zero entries once every code exists. Concurrent duplicate insertion returns HTTP 409; retry to skip the newly existing records.

Seeding registers application permissions only; assign the documented role permissions separately through existing Identity endpoints.

Source: [CafeApplicationPermissionsSeedController.cs](../../kvk.SeedAndUnitTesting/Features/ApplicationPermissions/CafeApplicationPermissionsSeedController.cs).

## Workflow boundaries

Endpoint permissions do not change service business rules, existing routes, query parameters, or record ownership. A lookup permission covers all query variants exposed by its action. Any customer/member self-service needs its own authorization model, separate from central staff RBAC.

- Actual C# namespaces use `Kvk.Cafe`; permission codes consistently use `KVK:Cafe:...`.
- Gateway routes use `/api/payments/cafe` and belong to Cafe. [CafePaymentGatewayService.cs](../../kvk.Cafe/Features/PaymentGateway/CafePaymentGatewayService.cs) verifies provider notification signatures. The callback receives no staff permission.
- Order creation/editing are daily Cashier operations; deleting an order is proposed for Admin. Menu writes are configuration operations and are also proposed for Admin.

