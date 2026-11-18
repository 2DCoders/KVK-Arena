# Badminton Application Permissions

Date: 2026-10-03 | Status: Endpoint permission checks implemented; role assignments proposed

## Scope and permission pattern

Reviewed all **5 controllers and 27 endpoints** in `kvk.Badminton`. **26 staff endpoints** use `AuthorizeByPermission`; **1 payment-provider callback** stays outside staff RBAC.

Follow [RBACSTAFF.MD](RBACSTAFF.MD), section 5: case-sensitive `KVK:{Module}:{Entity}:{Action}`, module `Badminton`, and supported actions `View`, `Create`, `Edit`, `Delete`, `Manage`. Names describe the business action rather than the HTTP verb: availability POSTs use View, payment confirmation uses Edit, pending-payment cancellation uses Delete, and internal maintenance uses Manage.

Cashier/Admin assignments below are recommendations inferred from endpoint behavior, not existing role grants. Cashier receives daily booking, availability, payment, lookup, and day-end access. Admin receives every listed permission, including court/slot configuration and maintenance. Endpoint checks authorize through active role permissions; they do not hardcode these role names.

Baseline before this change: none of the five controllers declared authorization attributes. The shared permission filter now challenges unauthenticated staff requests and forbids requests lacking the required active permission.

## Endpoint grid

Routes retain their actual controller prefixes and GUID constraints. No route changes are required.

### Booking

Source: [BookingController.cs](../../kvk.Badminton/Features/Booking/BookingController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/badminton/bookings/hold` | `CreateHold` | `KVK:Badminton:BookingHold:Create` | Yes | Yes | Reserve a single slot. |
| POST | `/api/badminton/bookings/confirm/{holdId:guid}` | `Confirm` | `KVK:Badminton:BookingPayment:Edit` | Yes | Yes | Confirm a held booking and record payment. |
| POST | `/api/badminton/bookings/multi-hold` | `CreateMultiHold` | `KVK:Badminton:BookingHold:Create` | Yes | Yes | Reserve multiple slots. |
| POST | `/api/badminton/bookings/confirm-multi` | `ConfirmMulti` | `KVK:Badminton:BookingPayment:Edit` | Yes | Yes | Confirm multiple held bookings and record payments. |
| POST | `/api/badminton/bookings/create` | `CreateSingleBookingWithPayment` | `KVK:Badminton:Booking:Create` | Yes | Yes | Create a single booking with payment initiation. |
| POST | `/api/badminton/bookings/create-multi` | `CreateMultiPayment` | `KVK:Badminton:BookingPayment:Create` | Yes | Yes | Initiate gateway payment for an existing batch of holds. |
| POST | `/api/badminton/bookings/notify` | `PaymentNotification` | None - provider callback | N/A | N/A | Payment-provider callback; service verifies its signature. |
| POST | `/api/badminton/bookings/internal/cleanup` | `Cleanup` | `KVK:Badminton:BookingMaintenance:Manage` | No | Yes | Remove expired holds. |
| POST | `/api/badminton/bookings/internal/fix-stale-pending` | `FixStalePendingBookings` | `KVK:Badminton:BookingMaintenance:Manage` | No | Yes | Repair stale pending booking records. |
| GET | `/api/badminton/bookings` | `GetBookingsList` | `KVK:Badminton:Booking:View` | Yes | Yes | List bookings using query filters. |
| POST | `/api/badminton/bookings/reverse` | `ReversePendingPayment` | `KVK:Badminton:BookingPayment:Delete` | Yes | Yes | Cancel pending payment; not a settled-payment refund. |

### Court

Source: [CourtController.cs](../../kvk.Badminton/Features/Court/CourtController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/badminton/courts` | `GetAll` | `KVK:Badminton:Court:View` | Yes | Yes | List courts. |
| GET | `/api/badminton/courts/{id:guid}` | `GetById` | `KVK:Badminton:Court:View` | Yes | Yes | View a court. |
| POST | `/api/badminton/courts` | `Create` | `KVK:Badminton:Court:Create` | No | Yes | Create court configuration. |
| PUT | `/api/badminton/courts/{id:guid}` | `Update` | `KVK:Badminton:Court:Edit` | No | Yes | Edit court configuration. |
| DELETE | `/api/badminton/courts/{id:guid}` | `Delete` | `KVK:Badminton:Court:Delete` | No | Yes | Delete court configuration. |

### CourtBookingTemporary

Source: [CourtBookingTemporaryController.cs](../../kvk.Badminton/Features/CourtBookingTemporary/CourtBookingTemporaryController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/temporary-bookings/check-availability` | `CheckAvailability` | `KVK:Badminton:BookingAvailability:View` | Yes | Yes | Check availability and pricing; accepts memberId/couponCode query values. |
| POST | `/api/temporary-bookings` | `CreateBooking` | `KVK:Badminton:CourtBookingTemporary:Create` | Yes | Yes | Create a temporary booking from form data. |
| POST | `/api/temporary-bookings/availability-for-certain-period` | `AvailabilityForCertainPeriod` | `KVK:Badminton:BookingAvailability:View` | Yes | Yes | Check availability across a requested period. |

### CourtSlotConfiguration

Source: [CourtSlotConfigurationController.cs](../../kvk.Badminton/Features/CourtSlotConfiguration/CourtSlotConfigurationController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/badminton/court-slot-configurations/court/{courtId:guid}` | `GetByCourtId` | `KVK:Badminton:CourtSlotConfiguration:View` | Yes | Yes | View configurations for a court. |
| GET | `/api/badminton/court-slot-configurations/court-slots-by-id/{courtId:guid}` | `GetAllSlotsByCourtId` | `KVK:Badminton:CourtSlotConfiguration:View` | Yes | Yes | View generated slots for a court. |
| GET | `/api/badminton/court-slot-configurations/availability-by-court` | `GetByCourtIdAndDate` | `KVK:Badminton:BookingAvailability:View` | Yes | Yes | View availability by courtId and date query values. |
| POST | `/api/badminton/court-slot-configurations` | `Create` | `KVK:Badminton:CourtSlotConfiguration:Create` | No | Yes | Create slot configuration. |
| PUT | `/api/badminton/court-slot-configurations/{id:guid}` | `Update` | `KVK:Badminton:CourtSlotConfiguration:Edit` | No | Yes | Edit slot configuration. |
| DELETE | `/api/badminton/court-slot-configurations/{id:guid}` | `Delete` | `KVK:Badminton:CourtSlotConfiguration:Delete` | No | Yes | Delete slot configuration. |

### DayEnd

Source: [DayEndController.cs](../../kvk.Badminton/Features/DayEnd/DayEndController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/badminton/dayend` | `Create` | `KVK:Badminton:DayEnd:Create` | Yes | Yes | Submit day end. |
| GET | `/api/badminton/dayend` | `Get` | `KVK:Badminton:DayEnd:View` | Yes | Yes | List day ends, optionally by date. |

## Unique permission creation grid

Register these **19 unique codes** in Identity's `ApplicationPermissions` table before assigning them through active role permissions. Users never receive permissions directly.

| Permission code | Cashier | Admin |
| --- | --- | --- |
| `KVK:Badminton:BookingHold:Create` | Yes | Yes |
| `KVK:Badminton:BookingPayment:Edit` | Yes | Yes |
| `KVK:Badminton:Booking:Create` | Yes | Yes |
| `KVK:Badminton:BookingPayment:Create` | Yes | Yes |
| `KVK:Badminton:BookingMaintenance:Manage` | No | Yes |
| `KVK:Badminton:Booking:View` | Yes | Yes |
| `KVK:Badminton:BookingPayment:Delete` | Yes | Yes |
| `KVK:Badminton:Court:View` | Yes | Yes |
| `KVK:Badminton:Court:Create` | No | Yes |
| `KVK:Badminton:Court:Edit` | No | Yes |
| `KVK:Badminton:Court:Delete` | No | Yes |
| `KVK:Badminton:BookingAvailability:View` | Yes | Yes |
| `KVK:Badminton:CourtBookingTemporary:Create` | Yes | Yes |
| `KVK:Badminton:CourtSlotConfiguration:View` | Yes | Yes |
| `KVK:Badminton:CourtSlotConfiguration:Create` | No | Yes |
| `KVK:Badminton:CourtSlotConfiguration:Edit` | No | Yes |
| `KVK:Badminton:CourtSlotConfiguration:Delete` | No | Yes |
| `KVK:Badminton:DayEnd:Create` | Yes | Yes |
| `KVK:Badminton:DayEnd:View` | Yes | Yes |

Cashier: **12** unique permissions. Admin: **19** unique permissions.

## Seed endpoint

Call `POST /api/seed/application-permissions/badminton` with a valid staff Bearer token and no request body. The caller must be an active staff member (`Status = Active`) with an active assignment to the active role named exactly `Admin`.

The seed inserts missing codes with descriptions and `IsActive = true`, skips existing codes (including inactive entries), and returns `total`, `inserted`, `skipped`, and `insertedCodes`. Existing records are preserved. A repeat call inserts zero entries once all codes exist. Concurrent duplicate insertion returns HTTP 409; retry to skip newly existing records.

Seeding only registers application permissions. Assign the grid's codes to Cashier/Admin roles separately using the existing Identity role-permission endpoints.

Source: [BadmintonApplicationPermissionsSeedController.cs](../../kvk.SeedAndUnitTesting/Features/ApplicationPermissions/BadmintonApplicationPermissionsSeedController.cs).

## Workflow boundaries

- `POST /api/badminton/bookings/notify` remains a provider callback. [BookingService.cs](../../kvk.Badminton/Features/Booking/BookingService.cs) verifies the notification signature before processing payments. Staff permission attributes apply to HTTP actions, so callbacks can still call service confirmation methods.
- Hold creation, payment initiation/confirmation, court lookup, and availability are mapped for staff use. Any customer-facing booking client requires separate customer authorization rules; central staff RBAC does not grant customer access.
- Internal cleanup and stale-pending repair use a separate maintenance permission, keeping those HTTP operations outside the proposed Cashier grants. Background/service invocations do not depend on controller permission checks.
- Temporary-booking routes start with `/api/temporary-bookings`, but belong to the Badminton module and use `KVK:Badminton:...` codes.
- Availability, hold creation, booking creation, payment confirmation, and pending-payment cancellation are distinct grants. Single booking creation includes its existing payment-initiation workflow. These permissions do not alter service business rules or scope records to an individual staff member.

