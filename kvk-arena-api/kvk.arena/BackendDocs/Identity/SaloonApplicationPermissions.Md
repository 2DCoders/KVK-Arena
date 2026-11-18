# Saloon Application Permissions

Date: 2026-10-03 | Status: Endpoint checks implemented; role assignments proposed

## Scope and naming

Reviewed **6 active controllers and 32 endpoints** in `kvk.Saloon`. **31 staff endpoints** require `AuthorizeByPermission`. The **1 payment-provider callback** remains outside staff RBAC.

Follow [RBACSTAFF.MD](RBACSTAFF.MD), section 5: exact, case-sensitive `KVK:{Module}:{Entity}:{Action}` with module `Saloon` and supported actions `View`, `Create`, `Edit`, `Delete`, `Manage`. Business actions determine names rather than HTTP verbs. Activate/deactivate use Manage; availability checks use View; payment confirmation uses Edit; pending-payment cancellation uses Delete.

Cashier/Admin assignments are proposals inferred from endpoint behavior, not existing database grants. Cashier receives daily operational access and relevant lookup permissions. Admin receives all listed codes, including configuration and administration. Permanent booking/order deletion, where present, is reserved for Admin. Endpoint authorization checks active role permissions rather than role names.

Baseline before this change: active controllers declared no staff permission attributes. The shared filter challenges unauthenticated requests and forbids requests without the required active permission.

## Endpoint grid

Routes below preserve controller prefixes, GUID constraints, and absolute action-route overrides. Actions sharing a business operation reuse the same code.

### SaloonBooking

Source: [SaloonBookingController.cs](../../kvk.Saloon/Features/Booking/SaloonBookingController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/saloon/saloons/bookings` | `GetAll` | `KVK:Saloon:Booking:View` | Yes | Yes | List bookings using query filters. |
| GET | `/api/saloon/saloons/bookings/{id:guid}` | `GetById` | `KVK:Saloon:Booking:View` | Yes | Yes | View a booking. |
| POST | `/api/saloon/bookings` | `Create` | `KVK:Saloon:Booking:Create` | Yes | Yes | Create a booking. |
| POST | `/api/saloon/bookings/create-with-payment` | `CreateWithPayment` | `KVK:Saloon:Booking:Create` | Yes | Yes | Create a booking with payment initiation. |
| POST | `/api/saloon/bookings/notify` | `PaymentNotification` | None - provider callback | N/A | N/A | Payment-provider notification; service verifies the signature. |
| POST | `/api/saloon/bookings/reverse` | `ReversePendingPayment` | `KVK:Saloon:BookingPayment:Delete` | Yes | Yes | Cancel pending payment; this is not a settled-payment refund. |
| GET | `/api/saloon/bookings/availability` | `CheckAvailability` | `KVK:Saloon:BookingAvailability:View` | Yes | Yes | Check booking availability. |
| GET | `/api/saloon/bookings/day-availability` | `CheckDayAvailability` | `KVK:Saloon:BookingAvailability:View` | Yes | Yes | Check day availability. |
| PUT | `/api/saloon/saloons/bookings/{id:guid}` | `Update` | `KVK:Saloon:Booking:Edit` | Yes | Yes | Edit booking details. |
| DELETE | `/api/saloon/saloons/bookings/{id:guid}` | `Delete` | `KVK:Saloon:Booking:Delete` | No | Yes | Permanently delete a booking. |

### DayEnd

Source: [DayEndController.cs](../../kvk.Saloon/Features/DayEnd/DayEndController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/saloon/dayend` | `Create` | `KVK:Saloon:DayEnd:Create` | Yes | Yes | Create DayEnd records. |
| GET | `/api/saloon/dayend` | `Get` | `KVK:Saloon:DayEnd:View` | Yes | Yes | View DayEnd records. |

### Saloon

Source: [SaloonController.cs](../../kvk.Saloon/Features/Saloon/SaloonController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/saloon/saloons` | `GetAll` | `KVK:Saloon:Saloon:View` | Yes | Yes | View Saloon records. |
| GET | `/api/saloon/saloons/{id:guid}` | `GetById` | `KVK:Saloon:Saloon:View` | Yes | Yes | View Saloon records. |
| POST | `/api/saloon/saloons` | `Create` | `KVK:Saloon:Saloon:Create` | No | Yes | Create Saloon records. |
| PUT | `/api/saloon/saloons/{id:guid}` | `Update` | `KVK:Saloon:Saloon:Edit` | No | Yes | Edit Saloon records. |
| DELETE | `/api/saloon/saloons/{id:guid}` | `Delete` | `KVK:Saloon:Saloon:Delete` | No | Yes | Delete Saloon records. |

### SaloonServiceItem

Source: [SaloonServiceItemController.cs](../../kvk.Saloon/Features/ServiceItem/SaloonServiceItemController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/saloon/service-items` | `GetAll` | `KVK:Saloon:ServiceItem:View` | Yes | Yes | View ServiceItem records. |
| GET | `/api/saloon/service-items/{id:guid}` | `GetById` | `KVK:Saloon:ServiceItem:View` | Yes | Yes | View ServiceItem records. |
| POST | `/api/saloon/service-items` | `Create` | `KVK:Saloon:ServiceItem:Create` | No | Yes | Create ServiceItem records. |
| PUT | `/api/saloon/service-items/{id:guid}` | `Update` | `KVK:Saloon:ServiceItem:Edit` | No | Yes | Edit ServiceItem records. |
| DELETE | `/api/saloon/service-items/{id:guid}` | `Delete` | `KVK:Saloon:ServiceItem:Delete` | No | Yes | Delete ServiceItem records. |

### SaloonStaff

Source: [SaloonStaffController.cs](../../kvk.Saloon/Features/Staff/SaloonStaffController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/saloon/staff` | `GetAll` | `KVK:Saloon:Staff:View` | Yes | Yes | View Staff records. |
| GET | `/api/saloon/staff/{id:guid}` | `GetById` | `KVK:Saloon:Staff:View` | Yes | Yes | View Staff records. |
| POST | `/api/saloon/staff` | `Create` | `KVK:Saloon:Staff:Create` | No | Yes | Create Staff records. |
| PUT | `/api/saloon/staff/{id:guid}` | `Update` | `KVK:Saloon:Staff:Edit` | No | Yes | Edit Staff records. |
| DELETE | `/api/saloon/staff/{id:guid}` | `Delete` | `KVK:Saloon:Staff:Delete` | No | Yes | Delete Staff records. |

### SaloonStaffSchedule

Source: [SaloonStaffScheduleController.cs](../../kvk.Saloon/Features/StaffSchedule/SaloonStaffScheduleController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/saloon/staff/{staffId:guid}/schedules` | `GetAll` | `KVK:Saloon:StaffSchedule:View` | Yes | Yes | View StaffSchedule records. |
| GET | `/api/saloon/staff/{staffId:guid}/schedules/{id:guid}` | `GetById` | `KVK:Saloon:StaffSchedule:View` | Yes | Yes | View StaffSchedule records. |
| POST | `/api/saloon/staff/{staffId:guid}/schedules` | `Create` | `KVK:Saloon:StaffSchedule:Create` | No | Yes | Create StaffSchedule records. |
| PUT | `/api/saloon/staff/{staffId:guid}/schedules/{id:guid}` | `Update` | `KVK:Saloon:StaffSchedule:Edit` | No | Yes | Edit StaffSchedule records. |
| DELETE | `/api/saloon/staff/{staffId:guid}/schedules/{id:guid}` | `Delete` | `KVK:Saloon:StaffSchedule:Delete` | No | Yes | Delete StaffSchedule records. |

## Unique permission creation grid

Register these **24 unique codes** in Identity's `ApplicationPermissions` table before assigning them through active role permissions. Users receive permissions through roles, never directly.

| Permission code | Cashier | Admin |
| --- | --- | --- |
| `KVK:Saloon:Booking:View` | Yes | Yes |
| `KVK:Saloon:Booking:Create` | Yes | Yes |
| `KVK:Saloon:BookingPayment:Delete` | Yes | Yes |
| `KVK:Saloon:BookingAvailability:View` | Yes | Yes |
| `KVK:Saloon:Booking:Edit` | Yes | Yes |
| `KVK:Saloon:Booking:Delete` | No | Yes |
| `KVK:Saloon:DayEnd:Create` | Yes | Yes |
| `KVK:Saloon:DayEnd:View` | Yes | Yes |
| `KVK:Saloon:Saloon:View` | Yes | Yes |
| `KVK:Saloon:Saloon:Create` | No | Yes |
| `KVK:Saloon:Saloon:Edit` | No | Yes |
| `KVK:Saloon:Saloon:Delete` | No | Yes |
| `KVK:Saloon:ServiceItem:View` | Yes | Yes |
| `KVK:Saloon:ServiceItem:Create` | No | Yes |
| `KVK:Saloon:ServiceItem:Edit` | No | Yes |
| `KVK:Saloon:ServiceItem:Delete` | No | Yes |
| `KVK:Saloon:Staff:View` | Yes | Yes |
| `KVK:Saloon:Staff:Create` | No | Yes |
| `KVK:Saloon:Staff:Edit` | No | Yes |
| `KVK:Saloon:Staff:Delete` | No | Yes |
| `KVK:Saloon:StaffSchedule:View` | Yes | Yes |
| `KVK:Saloon:StaffSchedule:Create` | No | Yes |
| `KVK:Saloon:StaffSchedule:Edit` | No | Yes |
| `KVK:Saloon:StaffSchedule:Delete` | No | Yes |

Cashier: **11** unique permissions. Admin: **24** unique permissions.

## Seed endpoint

Call `POST /api/seed/application-permissions/saloon` with a valid staff Bearer token and no request body. The caller must be an active staff member (`Status = Active`) with an active assignment to the active role named exactly `Admin`.

The seed inserts missing codes with descriptions and `IsActive = true`, skips existing codes (including inactive entries), and returns `total`, `inserted`, `skipped`, and `insertedCodes`. Existing descriptions, status, and audit fields are preserved. Repeated requests insert zero entries once every code exists. Concurrent duplicate insertion returns HTTP 409; retry to skip the newly existing records.

Seeding registers application permissions only; assign the documented role permissions separately through existing Identity endpoints.

Source: [SaloonApplicationPermissionsSeedController.cs](../../kvk.SeedAndUnitTesting/Features/ApplicationPermissions/SaloonApplicationPermissionsSeedController.cs).

## Workflow boundaries

Endpoint permissions do not change service business rules, existing routes, query parameters, or record ownership. A lookup permission covers all query variants exposed by its action. Any customer/member self-service needs its own authorization model, separate from central staff RBAC.

- Module/entity spelling follows `kvk.Saloon` and its routes: `KVK:Saloon:...`.
- Booking creation, payment, availability, and callback action routes use `~/api/saloon/bookings...`, overriding the `api/saloon/saloons/bookings` controller route. Existing list/detail/edit/delete routes still use the controller prefix.
- [SaloonBookingService.cs](../../kvk.Saloon/Features/Booking/SaloonBookingService.cs) verifies provider notification signatures. The callback remains outside staff RBAC. Booking Delete removes the record and is proposed for Admin, while pending-payment reversal is a separate Cashier/Admin grant.
- Staff and schedule reads support booking operations. Staff, schedule, service-item, and saloon writes are proposed for Admin.
- Some staff actions accept `saloonId` outside the route. Permission checks do not introduce saloon ownership filtering or change that binding.

