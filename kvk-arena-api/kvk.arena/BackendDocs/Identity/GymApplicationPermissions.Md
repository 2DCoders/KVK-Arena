# Gym Application Permissions

Date: 2026-10-03 | Status: Proposed staff permission mapping

## Scope and naming

Reviewed all 9 controller files in `kvk.Gym`, covering 39 HTTP endpoints. This document proposes permission names and Cashier/Admin role assignments; it does not create permissions in the database or change endpoint authorization.

Follow [RBACSTAFF.MD](RBACSTAFF.MD), section 5:

- Exact, case-sensitive format: `KVK:{Module}:{Entity}:{Action}`.
- Module: `Gym`. Actions: `View`, `Create`, `Edit`, `Delete`, `Manage` only.
- Use business entities rather than HTTP verbs. Upgrading a membership is `Edit`; restoring a deleted membership and approving/rejecting a trainer request use `Manage`.
- Register each unique code in `application_permissions` before assigning it through active role permissions. Staff receive permissions through roles, never directly.

**Role interpretation:** Yes/No below are recommended assignments, not existing role enforcement. Cashier covers daily registration, payments, attendance, and day-end operations. Admin receives all proposed staff permissions, including configuration, trainer approval, restoration, and permanent deletion. Most role choices are inferred from endpoint behavior. The trainer approval controller explicitly identifies approval/rejection as an admin operation; membership service comments identify cashier soft-delete workflows and admin permanent cleanup.

**Current authorization:** `GymDashboardController` and `DayEndController` have `[Authorize]`, and their three actions declare the permission codes shown below. The other seven controllers declare neither `[Authorize]` nor `[AuthorizeByPermission]`. This describes controller attributes only; global authorization policies and existing role assignments are outside this review.

## Endpoint grid

Each table links to its source controller. Route constraints such as `{id:guid}` are retained. Existing permission codes are identified in Notes; all other codes are proposals.

### Attendance

Source: [AttendanceController.cs](../../kvk.Gym/Features/Attendance/AttendanceController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/scan` | `Scan`: record attendance scan | `KVK:Gym:Attendance:Create` | Yes | Yes | Absolute action route overrides `api/gym/attendance`. Proposed for staff-operated scans; direct device callers need a separate device access model. |

### Dashboard

Source: [GymDashboardController.cs](../../kvk.Gym/Features/Dashboard/GymDashboardController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/gym/dashboard` | `Get`: view Gym dashboard | `KVK:Gym:Dashboard:View` | Yes | Yes | Permission already declared in controller. |

### Day end

Source: [DayEndController.cs](../../kvk.Gym/Features/DayEnd/DayEndController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gym/dayend` | `Create`: submit day end | `KVK:Gym:DayEnd:Create` | Yes | Yes | Permission already declared in controller. |
| GET | `/api/gym/dayend` | `Get`: list day ends, optionally by `date` | `KVK:Gym:DayEnd:View` | Yes | Yes | Permission already declared in controller. |

### Day-pass members

Source: [DayPassMembersController.cs](../../kvk.Gym/Features/DayPassMembers/DayPassMembersController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gym/day-pass-members` | `Create`: register day-pass member | `KVK:Gym:DayPassMember:Create` | Yes | Yes | Daily registration. |
| PUT | `/api/gym/day-pass-members/{id:guid}` | `Update`: edit day-pass member | `KVK:Gym:DayPassMember:Edit` | Yes | Yes | Daily member maintenance. |
| GET | `/api/gym/day-pass-members` | `Get`: list day-pass members | `KVK:Gym:DayPassMember:View` | Yes | Yes | Shares View with detail endpoint. |
| GET | `/api/gym/day-pass-members/{id:guid}` | `GetById`: view day-pass member | `KVK:Gym:DayPassMember:View` | Yes | Yes | Member lookup. |
| DELETE | `/api/gym/day-pass-members/{id:guid}` | `Delete`: delete day-pass member | `KVK:Gym:DayPassMember:Delete` | No | Yes | Proposed admin-only deletion. |

### Membership plans

Source: [MembershipPlansController.cs](../../kvk.Gym/Features/MembershipPlans/MembershipPlansController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gym/membership-plans` | `Create`: create plan | `KVK:Gym:MembershipPlan:Create` | No | Yes | Plan configuration. |
| GET | `/api/gym/membership-plans` | `Get`: list plans | `KVK:Gym:MembershipPlan:View` | Yes | Yes | Needed for registration and upgrades. |
| GET | `/api/gym/membership-plans/{id:guid}` | `GetById`: view plan | `KVK:Gym:MembershipPlan:View` | Yes | Yes | Shares View with list endpoint. |
| PUT | `/api/gym/membership-plans/{id:guid}` | `Update`: edit plan | `KVK:Gym:MembershipPlan:Edit` | No | Yes | Plan configuration. |
| DELETE | `/api/gym/membership-plans/{id:guid}` | `Delete`: delete plan | `KVK:Gym:MembershipPlan:Delete` | No | Yes | Plan configuration. |

### Memberships

Source: [MembershipsController.cs](../../kvk.Gym/Features/Memberships/MembershipsController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gym/members` | `Create`: register member | `KVK:Gym:Membership:Create` | Yes | Yes | Staff registration proposal; any customer self-registration requires separate member rules. |
| POST | `/api/gym/members/login` | `Login`: member login | None - member authentication | N/A | N/A | Outside staff RBAC per RBACSTAFF.MD sections 4 and 10. |
| PUT | `/api/gym/members/change-password` | `ChangePassword`: change member password | None - member account operation | N/A | N/A | Uses `memberId` outside the route and validates old/new passwords. Not a staff password-reset endpoint. |
| PUT | `/api/gym/members/{id:guid}/fingerprints` | `UpdateFingerprints`: enroll/update fingerprints | `KVK:Gym:MembershipFingerprint:Edit` | Yes | Yes | Separate permission for biometric enrollment. |
| PUT | `/api/gym/members/{id:guid}` | `Edit`: edit member | `KVK:Gym:Membership:Edit` | Yes | Yes | Member maintenance. |
| POST | `/api/gym/members/{id:guid}/upgrade` | `Upgrade`: change membership plan | `KVK:Gym:Membership:Edit` | Yes | Yes | Business action is Edit despite POST method. |
| GET | `/api/gym/members` | `Get`: list members, optionally `includeDeleted` | `KVK:Gym:Membership:View` | Yes | Yes | Existing route exposes deleted records through the same action. |
| GET | `/api/gym/members/{id:guid}` | `GetById`: view member | `KVK:Gym:Membership:View` | Yes | Yes | Shares View with list endpoint. |
| POST | `/api/gym/members/{id:guid}/soft-delete` | `SoftDelete`: soft-delete member | `KVK:Gym:Membership:Delete` | Yes | Yes | Reversible deletion; separate from permanent deletion permission. |
| POST | `/api/gym/members/{id:guid}/reverse-soft-delete` | `ReverseSoftDelete`: restore member | `KVK:Gym:Membership:Manage` | No | Yes | Proposed admin-controlled restoration. |
| DELETE | `/api/gym/members/{id:guid}` | `PermanentlyDelete`: permanently delete member | `KVK:Gym:MembershipPermanentDeletion:Delete` | No | Yes | Separate code prevents soft-delete permission from granting permanent deletion. Service business constraints still apply. |
| POST | `/api/gym/members/{id:guid}/assign-trainer` | `AssignTrainer`: assign trainer to member | `KVK:Gym:MembershipTrainer:Manage` | Yes | Yes | Assignment is a relationship management operation. |
| GET | `/api/gym/members/trainers` | `GetAllTrainers`: list trainers, optionally `includeDeleted` | `KVK:Gym:Trainer:View` | Yes | Yes | Trainer lookup for assignment; distinct from approval requests. |

### Payments

Source: [PaymentsController.cs](../../kvk.Gym/Features/Payments/PaymentsController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gym/members/{memberId:guid}/payments` | `Create`: record member payment | `KVK:Gym:Payment:Create` | Yes | Yes | Cashier payment collection. |
| GET | `/api/gym/members/{memberId:guid}/payments` | `GetByMember`: view member payments | `KVK:Gym:Payment:View` | Yes | Yes | Payment history. |
| GET | `/api/gym/payments` | `GetByDateRange`: view payments by optional `from` / `to` | `KVK:Gym:Payment:View` | Yes | Yes | Absolute action route overrides member-scoped controller route. |

### Payment gateway

Source: [PaymentGatewayController.cs](../../kvk.Gym/Features/PaymentGateway/PaymentGatewayController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/payments/create` | `CreatePayment`: initiate gateway payment | `KVK:Gym:PaymentGateway:Create` | Yes | Yes | Proposed staff use; controller does not establish whether a member client also calls it. |
| POST | `/api/payments/reverse` | `DeletePendingPayment`: remove pending payment and restore pending plan | `KVK:Gym:PaymentGateway:Delete` | Yes | Yes | Pending-payment cancellation, not a settled-payment refund. Proposed staff use; member ownership rules are separate if used by members. |
| POST | `/api/payments/notify` | `PaymentNotification`: gateway notification | None - payment provider callback | N/A | N/A | Provider callback uses signature verification in the service; do not require a staff role permission. |

The gateway routes have no `/gym` segment, but their proposed permission module remains `Gym` because this controller belongs to `kvk.Gym`.

### Trainer approval requests

Source: [TrainersApprovalRequestController.cs](../../kvk.Gym/Features/TrainersApprovalRequest/TrainersApprovalRequestController.cs)

| Method | Actual route | Action / purpose | Permission code | Cashier | Admin | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| POST | `/api/gym/trainers` | `Create`: submit trainer approval request | `KVK:Gym:TrainerApprovalRequest:Create` | No | Yes | Proposed staff administration; trainer self-submission, if required, belongs to separate member/trainer authorization. |
| GET | `/api/gym/trainers/{id:guid}` | `GetById`: view pending approval record | `KVK:Gym:TrainerApprovalRequest:View` | No | Yes | Approval administration. |
| GET | `/api/gym/trainers` | `GetAll`: list approval requests | `KVK:Gym:TrainerApprovalRequest:View` | No | Yes | These are approval requests, not the approved trainer lookup. |
| PUT | `/api/gym/trainers/{id:guid}` | `Update`: edit approval request | `KVK:Gym:TrainerApprovalRequest:Edit` | No | Yes | Proposed staff administration. |
| DELETE | `/api/gym/trainers/{id:guid}` | `Delete`: delete approval request | `KVK:Gym:TrainerApprovalRequest:Delete` | No | Yes | Proposed staff administration. |
| POST | `/api/gym/trainers/{id:guid}/approve` | `Approve`: approve or reject using `approvalStatus` | `KVK:Gym:TrainerApprovalRequest:Manage` | No | Yes | Explicit admin intent in controller comment. Use supported action Manage, not Approve/Reject. |

## Unique permission creation grid

Create/register these **30 unique codes**, checking for existing entries first. The three codes marked Declared are already referenced by controller attributes; that does not prove database registration. Assign the Yes entries to the corresponding active staff role permissions.

| Permission code | Cashier | Admin | Controller declaration |
| --- | --- | --- | --- |
| `KVK:Gym:Attendance:Create` | Yes | Yes | Proposed |
| `KVK:Gym:Dashboard:View` | Yes | Yes | Declared |
| `KVK:Gym:DayEnd:Create` | Yes | Yes | Declared |
| `KVK:Gym:DayEnd:View` | Yes | Yes | Declared |
| `KVK:Gym:DayPassMember:Create` | Yes | Yes | Proposed |
| `KVK:Gym:DayPassMember:Edit` | Yes | Yes | Proposed |
| `KVK:Gym:DayPassMember:View` | Yes | Yes | Proposed |
| `KVK:Gym:DayPassMember:Delete` | No | Yes | Proposed |
| `KVK:Gym:MembershipPlan:Create` | No | Yes | Proposed |
| `KVK:Gym:MembershipPlan:View` | Yes | Yes | Proposed |
| `KVK:Gym:MembershipPlan:Edit` | No | Yes | Proposed |
| `KVK:Gym:MembershipPlan:Delete` | No | Yes | Proposed |
| `KVK:Gym:Membership:Create` | Yes | Yes | Proposed |
| `KVK:Gym:Membership:Edit` | Yes | Yes | Proposed |
| `KVK:Gym:Membership:View` | Yes | Yes | Proposed |
| `KVK:Gym:Membership:Delete` | Yes | Yes | Proposed |
| `KVK:Gym:Membership:Manage` | No | Yes | Proposed |
| `KVK:Gym:MembershipFingerprint:Edit` | Yes | Yes | Proposed |
| `KVK:Gym:MembershipPermanentDeletion:Delete` | No | Yes | Proposed |
| `KVK:Gym:MembershipTrainer:Manage` | Yes | Yes | Proposed |
| `KVK:Gym:Trainer:View` | Yes | Yes | Proposed |
| `KVK:Gym:Payment:Create` | Yes | Yes | Proposed |
| `KVK:Gym:Payment:View` | Yes | Yes | Proposed |
| `KVK:Gym:PaymentGateway:Create` | Yes | Yes | Proposed |
| `KVK:Gym:PaymentGateway:Delete` | Yes | Yes | Proposed |
| `KVK:Gym:TrainerApprovalRequest:Create` | No | Yes | Proposed |
| `KVK:Gym:TrainerApprovalRequest:View` | No | Yes | Proposed |
| `KVK:Gym:TrainerApprovalRequest:Edit` | No | Yes | Proposed |
| `KVK:Gym:TrainerApprovalRequest:Delete` | No | Yes | Proposed |
| `KVK:Gym:TrainerApprovalRequest:Manage` | No | Yes | Proposed |

Cashier: **19** proposed unique permissions. Admin: **30** proposed unique permissions. Endpoint coverage: **36** staff-mapped endpoints and **3** non-staff endpoints, totaling **39**.

## Boundaries for later implementation

The grid is a proposed staff access policy. Member login, member password changes, provider callbacks, and any member/trainer self-service must retain their own authorization rules, as required by the staff-only scope in RBACSTAFF.MD. The absence of a staff permission here does not mean an endpoint should have unrestricted access.

An endpoint-level permission cannot distinguish query variants such as `includeDeleted=true` or restrict callers to their own records. The grid grants Cashier the existing member/trainer list actions including their query variants; any narrower data-access policy requires a separate implementation decision.

Approval requests and approved trainers use different permission entities. Permanent member deletion and soft deletion also use different entities to preserve separate grants within the allowed five-action naming standard.

Supporting workflow evidence: [MembershipService.cs](../../kvk.Gym/Services/MembershipService.cs), [GymPaymentGatewayService.cs](../../kvk.Gym/Services/GymPaymentGatewayService.cs), and [TrainerApprovalRequestService.cs](../../kvk.Gym/Features/TrainersApprovalRequest/TrainerApprovalRequestService.cs).
