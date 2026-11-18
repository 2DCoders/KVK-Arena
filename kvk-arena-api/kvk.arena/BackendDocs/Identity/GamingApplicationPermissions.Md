# Gaming Application Permissions

Date: 2026-10-03 | Status: Endpoint checks implemented; role assignments proposed

## Scope and naming

Reviewed **7 active controllers and 51 endpoints** in `kvk.Gaming`. **50 staff endpoints** require `AuthorizeByPermission`. The **1 payment-provider callback** remains outside staff RBAC.

Follow [RBACSTAFF.MD](RBACSTAFF.MD), section 5: exact, case-sensitive `KVK:{Module}:{Entity}:{Action}` with module `Gaming` and supported actions `View`, `Create`, `Edit`, `Delete`, `Manage`. Business actions determine names rather than HTTP verbs. Activate/deactivate use Manage; availability checks use View; payment confirmation uses Edit; pending-payment cancellation uses Delete.

Cashier/Admin assignments are proposals inferred from endpoint behavior, not existing database grants. Cashier receives daily operational access and relevant lookup permissions. Admin receives all listed codes, including configuration and administration. Permanent booking/order deletion, where present, is reserved for Admin. Endpoint authorization checks active role permissions rather than role names.

Baseline before this change: active controllers declared no staff permission attributes. The shared filter challenges unauthenticated requests and forbids requests without the required active permission.

## Endpoint grid

Routes below preserve controller prefixes, GUID constraints, and absolute action-route overrides. Actions sharing a business operation reuse the same code.

### AdditionalPurchase

Source: [AdditionalPurchaseController.cs](../../kvk.Gaming/Features/AdditionalPurchase/AdditionalPurchaseController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gaming-m/additional-purchases` | `Create` | `KVK:Gaming:AdditionalPurchase:Create` | No | Yes | Create AdditionalPurchase records. |
| PUT | `/api/gaming-m/additional-purchases` | `Update` | `KVK:Gaming:AdditionalPurchase:Edit` | No | Yes | Edit AdditionalPurchase records. |
| GET | `/api/gaming-m/additional-purchases/{id:guid}` | `GetById` | `KVK:Gaming:AdditionalPurchase:View` | Yes | Yes | View AdditionalPurchase records. |
| GET | `/api/gaming-m/additional-purchases` | `GetPagedList` | `KVK:Gaming:AdditionalPurchase:View` | Yes | Yes | View AdditionalPurchase records. |
| GET | `/api/gaming-m/additional-purchases/by-category/{categoryId:guid}` | `GetByCategory` | `KVK:Gaming:AdditionalPurchase:View` | Yes | Yes | View AdditionalPurchase records. |
| DELETE | `/api/gaming-m/additional-purchases/{id:guid}` | `SoftDelete` | `KVK:Gaming:AdditionalPurchase:Delete` | No | Yes | Delete AdditionalPurchase records. |
| PUT | `/api/gaming-m/additional-purchases/{id:guid}/activate` | `Activate` | `KVK:Gaming:AdditionalPurchase:Manage` | No | Yes | Activate AdditionalPurchase records. |
| PUT | `/api/gaming-m/additional-purchases/{id:guid}/deactivate` | `Deactivate` | `KVK:Gaming:AdditionalPurchase:Manage` | No | Yes | Deactivate AdditionalPurchase records. |

### DayEnd

Source: [DayEndController.cs](../../kvk.Gaming/Features/DayEnd/DayEndController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gaming/dayend` | `Create` | `KVK:Gaming:DayEnd:Create` | Yes | Yes | Create DayEnd records. |
| GET | `/api/gaming/dayend` | `Get` | `KVK:Gaming:DayEnd:View` | Yes | Yes | View DayEnd records. |

### Game

Source: [GameController.cs](../../kvk.Gaming/Features/Game/GameController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gaming-m/games` | `Create` | `KVK:Gaming:Game:Create` | No | Yes | Create Game records. |
| PUT | `/api/gaming-m/games` | `Update` | `KVK:Gaming:Game:Edit` | No | Yes | Edit Game records. |
| GET | `/api/gaming-m/games/{id:guid}` | `GetById` | `KVK:Gaming:Game:View` | Yes | Yes | View Game records. |
| GET | `/api/gaming-m/games` | `GetPagedList` | `KVK:Gaming:Game:View` | Yes | Yes | View Game records. |
| PUT | `/api/gaming-m/games/{id:guid}/activate` | `Activate` | `KVK:Gaming:Game:Manage` | No | Yes | Activate Game records. |
| PUT | `/api/gaming-m/games/{id:guid}/deactivate` | `Deactivate` | `KVK:Gaming:Game:Manage` | No | Yes | Deactivate Game records. |
| DELETE | `/api/gaming-m/games/{id:guid}` | `Delete` | `KVK:Gaming:Game:Manage` | No | Yes | DELETE currently calls DeactivateAsync; use Manage for the actual deactivation behavior. |

### GamingBooking

Source: [GamingBookingController.cs](../../kvk.Gaming/Features/GamingBooking/GamingBookingController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gaming-m/gaming-bookings` | `CreateGamingBooking` | `KVK:Gaming:Booking:Create` | Yes | Yes | Create a gaming booking. |
| POST | `/api/gaming-m/gaming-bookings/multi-hold` | `CreateMultiGamingHold` | `KVK:Gaming:BookingHold:Create` | Yes | Yes | Reserve multiple gaming slots. |
| POST | `/api/gaming-m/gaming-bookings/create-with-payment` | `CreateSingleGamingBookingWithPayment` | `KVK:Gaming:Booking:Create` | Yes | Yes | Create a booking with payment initiation. |
| POST | `/api/gaming-m/gaming-bookings/create-multi-payment` | `CreateMultiGamingPayment` | `KVK:Gaming:BookingPayment:Create` | Yes | Yes | Initiate payment for an existing batch of holds. |
| POST | `/api/gaming-m/gaming-bookings/confirm/{holdId:guid}` | `ConfirmGamingBooking` | `KVK:Gaming:BookingPayment:Edit` | Yes | Yes | Confirm a held booking and record payment. |
| POST | `/api/gaming-m/gaming-bookings/confirm-multi` | `ConfirmMulti` | `KVK:Gaming:BookingPayment:Edit` | Yes | Yes | Confirm multiple held bookings and record payments. |
| POST | `/api/gaming-m/gaming-bookings/notify` | `GamingPaymentNotification` | None - provider callback | N/A | N/A | Payment-provider notification; service verifies the signature. |
| PUT | `/api/gaming-m/gaming-bookings/cancel` | `CancelGamingBooking` | `KVK:Gaming:Booking:Delete` | Yes | Yes | Cancel a booking by changing its status; does not remove the record. |
| GET | `/api/gaming-m/gaming-bookings/{id:guid}` | `GetGamingBookingById` | `KVK:Gaming:Booking:View` | Yes | Yes | View a booking. |
| GET | `/api/gaming-m/gaming-bookings` | `GetGamingBookingsList` | `KVK:Gaming:Booking:View` | Yes | Yes | List bookings using query filters. |
| GET | `/api/gaming-m/gaming-bookings/by-station` | `GetBookingsByGamingStation` | `KVK:Gaming:Booking:View` | Yes | Yes | List bookings for a station. |
| GET | `/api/gaming-m/gaming-bookings/by-customer` | `GetBookingsByCustomer` | `KVK:Gaming:Booking:View` | Yes | Yes | List bookings for a customer. |
| POST | `/api/gaming-m/gaming-bookings/internal/fix-stale-pending` | `FixStalePendingBookings` | `KVK:Gaming:BookingMaintenance:Manage` | No | Yes | Repair stale pending booking records. |
| POST | `/api/gaming-m/gaming-bookings/reverse` | `ReversePendingPayment` | `KVK:Gaming:BookingPayment:Delete` | Yes | Yes | Cancel pending payment; this is not a settled-payment refund. |

### GamingCategory

Source: [GamingCategoryController.cs](../../kvk.Gaming/Features/GamingCategory/GamingCategoryController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gaming-m/gaming-categories` | `Create` | `KVK:Gaming:GamingCategory:Create` | No | Yes | Create GamingCategory records. |
| PUT | `/api/gaming-m/gaming-categories` | `Update` | `KVK:Gaming:GamingCategory:Edit` | No | Yes | Edit GamingCategory records. |
| GET | `/api/gaming-m/gaming-categories/{id:guid}` | `GetById` | `KVK:Gaming:GamingCategory:View` | Yes | Yes | View GamingCategory records. |
| GET | `/api/gaming-m/gaming-categories` | `GetPagedList` | `KVK:Gaming:GamingCategory:View` | Yes | Yes | View GamingCategory records. |
| DELETE | `/api/gaming-m/gaming-categories/{id:guid}` | `SoftDelete` | `KVK:Gaming:GamingCategory:Delete` | No | Yes | Delete GamingCategory records. |
| PUT | `/api/gaming-m/gaming-categories/{id:guid}/activate` | `Activate` | `KVK:Gaming:GamingCategory:Manage` | No | Yes | Activate GamingCategory records. |
| PUT | `/api/gaming-m/gaming-categories/{id:guid}/deactivate` | `Deactivate` | `KVK:Gaming:GamingCategory:Manage` | No | Yes | Deactivate GamingCategory records. |

### GamingSlotGeneration

Source: [GamingSlotGenerationController.cs](../../kvk.Gaming/Features/GamingSlotGeneration/GamingSlotGenerationController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gaming-m/gaming-slot-generation` | `GenerateSlotsForGamingCategoryAsync` | `KVK:Gaming:GamingSlotGeneration:Create` | No | Yes | Generate slots for a gaming category. |
| PUT | `/api/gaming-m/gaming-slot-generation` | `Update` | `KVK:Gaming:GamingSlotGeneration:Edit` | No | Yes | Edit slot generation configuration. |
| DELETE | `/api/gaming-m/gaming-slot-generation/{id:guid}` | `Delete` | `KVK:Gaming:GamingSlotGeneration:Delete` | No | Yes | Delete slot generation configuration. |
| GET | `/api/gaming-m/gaming-slot-generation/availability-by-station-category` | `GetByStationCategoryIdAndDate` | `KVK:Gaming:BookingAvailability:View` | Yes | Yes | View availability by stationId, categoryId and date. |
| GET | `/api/gaming-m/gaming-slot-generation/configuration-by-category` | `GetConfigurationByCategory` | `KVK:Gaming:GamingSlotGeneration:View` | Yes | Yes | View slot configuration by categoryId. |

### GamingStation

Source: [GamingStationController.cs](../../kvk.Gaming/Features/GamingStation/GamingStationController.cs)

| Method | Actual route | Action | Permission code | Cashier | Admin | Purpose / notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gaming-m/gaming-stations` | `Create` | `KVK:Gaming:GamingStation:Create` | No | Yes | Create GamingStation records. |
| PUT | `/api/gaming-m/gaming-stations` | `Update` | `KVK:Gaming:GamingStation:Edit` | No | Yes | Edit GamingStation records. |
| GET | `/api/gaming-m/gaming-stations/{id:guid}` | `GetById` | `KVK:Gaming:GamingStation:View` | Yes | Yes | View GamingStation records. |
| GET | `/api/gaming-m/gaming-stations` | `GetList` | `KVK:Gaming:GamingStation:View` | Yes | Yes | View GamingStation records. |
| GET | `/api/gaming-m/gaming-stations/by-category/{categoryId:guid}` | `GetStationsByCategory` | `KVK:Gaming:GamingStation:View` | Yes | Yes | View GamingStation records. |
| DELETE | `/api/gaming-m/gaming-stations/{id:guid}` | `SoftDelete` | `KVK:Gaming:GamingStation:Delete` | No | Yes | Delete GamingStation records. |
| PUT | `/api/gaming-m/gaming-stations/{id:guid}/activate` | `Activate` | `KVK:Gaming:GamingStation:Manage` | No | Yes | Activate GamingStation records. |
| PUT | `/api/gaming-m/gaming-stations/{id:guid}/deactivate` | `Deactivate` | `KVK:Gaming:GamingStation:Manage` | No | Yes | Deactivate GamingStation records. |

## Unique permission creation grid

Register these **34 unique codes** in Identity's `ApplicationPermissions` table before assigning them through active role permissions. Users receive permissions through roles, never directly.

| Permission code | Cashier | Admin |
| --- | --- | --- |
| `KVK:Gaming:AdditionalPurchase:Create` | No | Yes |
| `KVK:Gaming:AdditionalPurchase:Edit` | No | Yes |
| `KVK:Gaming:AdditionalPurchase:View` | Yes | Yes |
| `KVK:Gaming:AdditionalPurchase:Delete` | No | Yes |
| `KVK:Gaming:AdditionalPurchase:Manage` | No | Yes |
| `KVK:Gaming:DayEnd:Create` | Yes | Yes |
| `KVK:Gaming:DayEnd:View` | Yes | Yes |
| `KVK:Gaming:Game:Create` | No | Yes |
| `KVK:Gaming:Game:Edit` | No | Yes |
| `KVK:Gaming:Game:View` | Yes | Yes |
| `KVK:Gaming:Game:Manage` | No | Yes |
| `KVK:Gaming:Booking:Create` | Yes | Yes |
| `KVK:Gaming:BookingHold:Create` | Yes | Yes |
| `KVK:Gaming:BookingPayment:Create` | Yes | Yes |
| `KVK:Gaming:BookingPayment:Edit` | Yes | Yes |
| `KVK:Gaming:Booking:Delete` | Yes | Yes |
| `KVK:Gaming:Booking:View` | Yes | Yes |
| `KVK:Gaming:BookingMaintenance:Manage` | No | Yes |
| `KVK:Gaming:BookingPayment:Delete` | Yes | Yes |
| `KVK:Gaming:GamingCategory:Create` | No | Yes |
| `KVK:Gaming:GamingCategory:Edit` | No | Yes |
| `KVK:Gaming:GamingCategory:View` | Yes | Yes |
| `KVK:Gaming:GamingCategory:Delete` | No | Yes |
| `KVK:Gaming:GamingCategory:Manage` | No | Yes |
| `KVK:Gaming:GamingSlotGeneration:Create` | No | Yes |
| `KVK:Gaming:GamingSlotGeneration:Edit` | No | Yes |
| `KVK:Gaming:GamingSlotGeneration:Delete` | No | Yes |
| `KVK:Gaming:BookingAvailability:View` | Yes | Yes |
| `KVK:Gaming:GamingSlotGeneration:View` | Yes | Yes |
| `KVK:Gaming:GamingStation:Create` | No | Yes |
| `KVK:Gaming:GamingStation:Edit` | No | Yes |
| `KVK:Gaming:GamingStation:View` | Yes | Yes |
| `KVK:Gaming:GamingStation:Delete` | No | Yes |
| `KVK:Gaming:GamingStation:Manage` | No | Yes |

Cashier: **15** unique permissions. Admin: **34** unique permissions.

## Seed endpoint

Call `POST /api/seed/application-permissions/gaming` with a valid staff Bearer token and no request body. The caller must be an active staff member (`Status = Active`) with an active assignment to the active role named exactly `Admin`.

The seed inserts missing codes with descriptions and `IsActive = true`, skips existing codes (including inactive entries), and returns `total`, `inserted`, `skipped`, and `insertedCodes`. Existing descriptions, status, and audit fields are preserved. Repeated requests insert zero entries once every code exists. Concurrent duplicate insertion returns HTTP 409; retry to skip the newly existing records.

Seeding registers application permissions only; assign the documented role permissions separately through existing Identity endpoints.

Source: [GamingApplicationPermissionsSeedController.cs](../../kvk.SeedAndUnitTesting/Features/ApplicationPermissions/GamingApplicationPermissionsSeedController.cs).

## Workflow boundaries

Endpoint permissions do not change service business rules, existing routes, query parameters, or record ownership. A lookup permission covers all query variants exposed by its action. Any customer/member self-service needs its own authorization model, separate from central staff RBAC.

- [GamingSlotConfigurationController.cs](../../kvk.Gaming/Features/GamingSlotConfiguration/GamingSlotConfigurationController.cs) and [GamingStationGameMappingController.cs](../../kvk.Gaming/Features/GamingStationGameMapping/GamingStationGameMappingController.cs) are fully commented out and expose no active endpoints. They receive no permission codes or code changes. Slot configuration currently uses GamingSlotGenerationController.
- The Game DELETE action calls `DeactivateAsync`, so it uses `KVK:Gaming:Game:Manage`, matching its actual behavior.
- Booking cancellation uses `Booking:Delete` while changing the booking status to Cancelled. Pending-payment reversal uses `BookingPayment:Delete`; stale-pending repair uses the separate Admin-only `BookingMaintenance:Manage` grant.
- The notification callback remains outside staff RBAC. [GamingBookingService.cs](../../kvk.Gaming/Features/GamingBooking/GamingBookingService.cs) verifies its signature. Internal service/background calls do not pass through HTTP controller permission filters.
- Actual route prefixes include both `/api/gaming-m` and `/api/gaming/dayend`; all codes use the Gaming module.

