# Gym Membership Implementation Plan

Checklist (implementation-ready)
- [ ] Create/modify domain models: `kvk.Gym\Domain\Membership.cs`, `MemberAttendance.cs`, `MemberPayment.cs`
- [ ] Add `DbSet<>` entries in `kvk.Gym\GymDbContext.cs` and create EF Core migrations
- [ ] Add `MembershipNumberFormatter` to `kvk.BuildingBlocks\Common` (display-only formatter)
- [ ] Implement services: `IMembershipService`/`MembershipService`, `IAttendanceService`/`AttendanceService`, `IPaymentService`/`PaymentService`
- [ ] Implement controllers: `MembershipsController`, `PaymentsController`, `AttendanceController`
- [ ] Add event contract and integration: Identity → `kvk.ModuleIntegrator` → Gym handler
- [ ] Add unit & integration tests
- [ ] Commit `BackendDocs/Gym/GYMMEMBERSHIP.MD`

---

## Overview
This document describes the design and implementation plan for the Gym membership features. It covers domain models, persistence, services, APIs, Identity → Gym integration (decoupled via `kvk.ModuleIntegrator` events), fingerprint privacy policy, and membership-number behavior.

Primary requirements from product:
- Members register with details. If `Fingerprint1` and `Fingerprint2` are null, membership must be `Inactive`.
- Attendance recorded using fingerprint scan events. Provide an `AttendanceController` that accepts device-side fingerprint ids and stores attendance records.
- Member payments exposed via a separate API. Only Clients require payment records; Trainers and Staff do not.
- When Staff are registered in `kvk.Identity` and assigned access to Gym module, Gym must auto-create a matching `Membership` record (decoupled via `kvk.ModuleIntegrator` events).
- Persist a GUID as primary key; provide a display-only membership number formatted like `GYM-MEM-20260001` (no sequence incrementing for uniqueness).
- Store only device-side fingerprint IDs (no raw templates) to preserve privacy.

---

## Domain models (high level)
All new/updated classes live in `kvk.Gym\Domain`.

1. Membership (update `Membership.cs`)
- Id: Guid (PK)
- IdentityUserId: string? (nullable) — to link with Identity users when applicable
- FirstName, LastName, Email, Phone — inherited from `User` base
- DateOfBirth: DateTime
- MembershipType: enum (Client, Trainer, Staff)
- Gender: enum
- MembershipStatus: enum (Active, Inactive, Suspended)
- MembershipNumber: string (display-only formatted by `MembershipNumberFormatter`)
- DeviceFingerprintId1: string? (device-provided identifier)
- DeviceFingerprintId2: string?
- CreatedAt: DateTime
- UpdatedAt: DateTime

Business rules: set `MembershipStatus = Inactive` at creation if both fingerprint ids are null. For Trainers/Staff, payments are not required to activate.

2. MemberAttendance (`MemberAttendance.cs`)
- Id: Guid (PK)
- MembershipId: Guid (FK to Membership)
- ScanTime: DateTime (UTC)
- FingerprintIndex: int (1 or 2)
- DeviceId: string (scanner device identifier)
- RoomId: string? (optional location/room)
- RawMetadata: string? (optional JSON from device; do not include raw templates)
- CreatedAt: DateTime

3. MemberPayment (`MemberPayment.cs`) — extend if already present
- Id: Guid (PK)
- MembershipId: Guid (FK)
- Amount: decimal
- PaymentType: enum (Cash, Card, Online)
- PaymentStatus: enum (Pending, Completed, Failed)
- MemberShipStartDate: DateTime?
- MemberShipRenewalDate: DateTime?
- MemberShipEndDate: DateTime?
- TransactionReference: string?
- CreatedAt: DateTime

4. DbContext changes
- `kvk.Gym\GymDbContext.cs` add properties:
  - public DbSet<Membership> Memberships { get; set; }
  - public DbSet<MemberAttendance> MemberAttendances { get; set; }
  - public DbSet<MemberPayment> MemberPayments { get; set; }

- Add entity configuration if needed (indexes on DeviceFingerprintId1/2 for fast lookup, unique index on IdentityUserId if present).

---

## Membership number policy
- Persist a GUID as the primary key for uniqueness and references.
- Provide a display-only formatter in `kvk.BuildingBlocks\Common\MembershipNumberFormatter.cs` with a static API:
  - string Format(MembershipType type, int year, string token = "0001")
- Example outputs:
  - Client: `GYM-MEM-20260001`
  - Trainer: `GYM-TRA-20260001`
  - Staff: `GYM-STA-20260001`
- Note: `token` is cosmetic for display; the system does not rely on it for uniqueness. If a project later requires sequential numbers, add a `MembershipSequence` table and generator.

---

## Fingerprint & privacy policy
- Only store device-provided fingerprint identifiers (e.g., `DeviceFingerprintId`) — short string or numeric id supplied by the scanner device.
- Do NOT store raw fingerprint templates or raw biometric data in the database.
- If a scanner cannot supply an identifier and only provides templates, the integration must convert templates into a device-side ID before persisting, or use an encrypted hash field and consult security team.

---

## API surface
All controllers will be in `kvk.Gym\Features\Controllers` (or similar namespace). Use consistent route prefix: `/api/gym`.

1. MembershipsController

- POST /api/gym/members
  - Purpose: Register a member (initial details only). Payments are not handled here.
  - Request (JSON):
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+123456789",
      "dateOfBirth": "1990-01-01",
      "membershipType": "Client", // Client | Trainer | Staff
      "gender": "Male",
      "deviceFingerprintId1": "scanner-123-idx-1", // optional
      "deviceFingerprintId2": "scanner-123-idx-2"  // optional
    }
  - Response 201 Created (JSON):
    {
      "id": "guid",
      "membershipNumber": "GYM-MEM-20260001",
      "membershipStatus": "Inactive",
      "identityUserId": null
    }
  - Rule: If both fingerprint ids are null -> status = Inactive.

- PUT /api/gym/members/{id}/fingerprints
  - Purpose: Update fingerprint ids (device-side ids only). May activate membership depending on rules.
  - Request (JSON): { "deviceFingerprintId1": "...", "deviceFingerprintId2": "..." }
  - Response 200 OK with updated membership

- GET /api/gym/members/{id}
  - Purpose: Get member details including display `membershipNumber`, last attendance and payment summary.
  - Response 200 OK: member payload with nested attendance summary and payments if applicable.

2. PaymentsController
- POST /api/gym/members/{id}/payments
  - Purpose: Create a payment for a member. Only allowed if membershipType == Client.
  - Request example:
    {
      "amount": 100.00,
      "paymentType": "Card",
      "transactionReference": "trx-1234",
      "startDate": "2026-06-01",
      "endDate": "2027-05-31"
    }
  - Response: 201 Created with payment record.
  - Rule: If member is Trainer or Staff -> return 400 Bad Request.

- GET /api/gym/members/{id}/payments
  - Purpose: List payments for the member (clients primarily).

3. AttendanceController (scanner contract)
- POST /api/gym/attendance/scan
  - Purpose: Accept fingerprint scan events from scanners and record attendance.
  - Request (JSON):
    {
      "deviceFingerprintId": "scanner-123-idx-1",
      "deviceId": "scanner-uuid-001",
      "roomId": "gym-floor-1",
      "scanTime": "2026-05-19T08:30:00Z", // optional; server uses UTC time if absent
      "rawMetadata": { "signalQuality": 85 } // optional
    }
  - Behavior:
    - Service attempts to match `deviceFingerprintId` against `DeviceFingerprintId1` and `DeviceFingerprintId2` on `Membership` table (fast index).
    - If matched: create `MemberAttendance` record with `MembershipId`, `ScanTime`, `FingerprintIndex` (1 or 2), `DeviceId`, `RoomId` and return 200 OK with member id and status.
    - If unmatched: create an `unmatched` attendance record (optional) and return 404 or 200 with `matched:false` depending on policy. Document decision.

---

## Identity → Gym integration (decoupled)
Use `kvk.ModuleIntegrator` (Option B) to decouple Identity from Gym. Flow:
1. In `kvk.Identity`, when a staff is created or assigned modules, publish an event: `StaffAssignedToModuleEvent` with payload:
   - IdentityUserId (GUID as string)
   - Email
   - FullName
   - AssignedModules: string[]
   - Timestamp

2. `kvk.ModuleIntegrator` receives/publishes the event on the integrator bus. Gym subscribes to integrator events.

3. Gym event handler (registered at module init) receives `StaffAssignedToModuleEvent`.
   - If AssignedModules contains `ModuleConstants.Gym`, call `IMembershipService.EnsureMembershipForStaff(identityUserId, email, fullName)`.
   - `EnsureMembershipForStaff` behavior:
     - Idempotent: match by `IdentityUserId` if present; otherwise match by email.
     - If membership exists: update fields (e.g., name, email) and ensure `MembershipType = Staff`.
     - If not present: create `Membership` with `MembershipType = Staff`, set `IdentityUserId`, set `MembershipNumber = MembershipNumberFormatter.Format(MembershipType.Staff, year)`, set `MembershipStatus` to Active (or Inactive per local policy; product chosen: auto-integrate record — then set Active).
   - Trainers/staff do not get payment records.

Delivery guarantees & idempotency:
- Start with at-least-once event deliveries and idempotent handlers.
- If you later require exactly-once durable delivery, replace the integrator transport with a durable message bus (Rabbit/Kafka) and implement transactional outbox/inbox patterns.

---

## Implementation tasks (detailed)
1. Create domain classes
   - Edit `kvk.Gym\Domain\Membership.cs`: add `Id`, `IdentityUserId`, `DeviceFingerprintId1`, `DeviceFingerprintId2`, `CreatedAt`, `UpdatedAt`. Keep existing `User` inheritance fields.
   - Implement `kvk.Gym\Domain\MemberAttendance.cs` (create file) with fields described above.
   - Update `kvk.Gym\Domain\MemberPayment.cs` to include `Id`, `TransactionReference`, `CreatedAt`.

2. DbContext & migrations
   - Update `kvk.Gym\GymDbContext.cs` to add DbSet properties and modelBuilder configuration (indexes on fingerprint fields).
   - Add EF Core migration: `dotnet ef migrations add AddGymMemberships -p kvk.Gym -s kvk.Host` (adjust project arguments per solution layout) and run `dotnet ef database update` in dev.

3. BuildingBlocks formatter
   - Add file `kvk.BuildingBlocks\Common\MembershipNumberFormatter.cs`:
     - Namespace: `kvk.BuildingBlocks.Common`
     - Public static class `MembershipNumberFormatter` with method `Format(MembershipType type, int year, string token = "0001")` that returns a string.

4. Services & DI
   - Create `kvk.Gym\Services\IMembershipService.cs` and `MembershipService.cs` with methods: `CreateMemberAsync`, `UpdateFingerprintsAsync`, `GetMemberAsync`, `EnsureMembershipForStaffAsync`.
   - Create `kvk.Gym\Services\IAttendanceService.cs` and `AttendanceService.cs` with `RecordScanAsync`.
   - Create `kvk.Gym\Services\IPaymentService.cs` and `PaymentService.cs`.
   - Register services in module initializer implementing `IModuleInitializer`.

5. Controllers
   - Implement `MembershipsController`, `PaymentsController`, `AttendanceController` and add routing and request validation.

6. Identity event publication
   - In `kvk.Identity\Features\StaffModule\StaffModuleService.AssignModulesToStaffAsync`, after succesfully assigning modules, publish `StaffAssignedToModuleEvent` to `kvk.ModuleIntegrator` bus (or the local integrator API).

7. Implement Gym event subscriber
   - Add subscriber in `kvk.Gym` (registered at startup) to receive integrator events and call `IMembershipService.EnsureMembershipForStaffAsync`.

8. Tests & docs
   - Unit tests for formatter, membership creation and activation rules, attendance matching, payment restrictions, and integration event flows.
   - Add `BackendDocs/Gym/GYMMEMBERSHIP.MD` to repo (this file).

---

## Migrations & local dev commands
Example EF Core commands (adjust project names/paths as needed):

```powershell
# From solution root
cd "D:\KVK Arena\Code\KVK-Arena\kvk-arena-api\kvk.arena"
# Add migration for kvk.Gym (change startup project and project flags to match solution layout)
dotnet ef migrations add AddGymMemberships -p kvk.Gym -s kvk.Host
# Apply migration to the database
dotnet ef database update -p kvk.Gym -s kvk.Host
```

---

## Tests and QA checklist
- [ ] Formatter unit tests for each MembershipType
- [ ] Membership creation tests: missing fingerprints -> Inactive
- [ ] Update fingerprint tests -> membership activation for Trainer/Staff immediate; for Client depends on payment policy
- [ ] Attendance scan tests: matched membership, unmatched behavior
- [ ] Payment tests: only clients can create payments
- [ ] Integration test: Identity `StaffAssignedToModuleEvent` triggers Gym `EnsureMembershipForStaff` idempotently

---

## Notes & next steps
- Place this file at `BackendDocs/Gym/GYMMEMBERSHIP.MD` (already created).
- If you want me to implement the domain classes, services, or controllers now, confirm which file(s) to change first and I will make the code edits and add migrations.


End of document.

