using System.Security.Claims;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace kvk.SeedAndUnitTesting.Features.ApplicationPermissions;

[ApiController]
[Route("api/seed/application-permissions/badminton")]
public class BadmintonApplicationPermissionsSeedController(IdentityApplicationDbContext context) : ControllerBase
{
    // These codes mirror BackendDocs/Identity/BadmintonApplicationPermissions.Md.
    private static readonly (string Code, string Description)[] Permissions =
    [
        ("KVK:Badminton:BookingHold:Create", "Badminton: Reserve a single slot."),
        ("KVK:Badminton:BookingPayment:Edit", "Badminton: Confirm a held booking and record payment."),
        ("KVK:Badminton:Booking:Create", "Badminton: Create a single booking with payment initiation."),
        ("KVK:Badminton:BookingPayment:Create", "Badminton: Initiate gateway payment for an existing batch of holds."),
        ("KVK:Badminton:BookingMaintenance:Manage", "Badminton: Remove expired holds."),
        ("KVK:Badminton:Booking:View", "Badminton: List bookings using query filters."),
        ("KVK:Badminton:BookingPayment:Delete", "Badminton: Cancel pending payment; not a settled-payment refund."),
        ("KVK:Badminton:Court:View", "Badminton: List courts."),
        ("KVK:Badminton:Court:Create", "Badminton: Create court configuration."),
        ("KVK:Badminton:Court:Edit", "Badminton: Edit court configuration."),
        ("KVK:Badminton:Court:Delete", "Badminton: Delete court configuration."),
        ("KVK:Badminton:BookingAvailability:View", "Badminton: Check availability and pricing; accepts memberId/couponCode query values."),
        ("KVK:Badminton:CourtBookingTemporary:Create", "Badminton: Create a temporary booking from form data."),
        ("KVK:Badminton:CourtSlotConfiguration:View", "Badminton: View configurations for a court."),
        ("KVK:Badminton:CourtSlotConfiguration:Create", "Badminton: Create slot configuration."),
        ("KVK:Badminton:CourtSlotConfiguration:Edit", "Badminton: Edit slot configuration."),
        ("KVK:Badminton:CourtSlotConfiguration:Delete", "Badminton: Delete slot configuration."),
        ("KVK:Badminton:DayEnd:Create", "Badminton: Submit day end."),
        ("KVK:Badminton:DayEnd:View", "Badminton: List day ends, optionally by date.")
    ];

    [HttpPost]
    public async Task<IActionResult> Seed(CancellationToken cancellationToken = default)
    {
        // var userIdClaim = User.FindFirst("UserId")?.Value
        //     ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        // if (!Guid.TryParse(userIdClaim, out var staffId) || staffId == Guid.Empty)
        //     return Forbid();

        // Bootstrap authorization must not depend on permissions that have not been seeded yet.
        // var isAdmin = await (
        //     from staffRole in context.StaffRoles
        //     join role in context.Roles on staffRole.RoleId equals role.Id
        //     join staff in context.Staffs on staffRole.StaffId equals staff.Id
        //     where staffRole.StaffId == staffId && staffRole.IsActive
        //         && role.IsActive && role.Name == "Admin" && staff.Status == "Active"
        //     select staffRole.Id).AnyAsync(cancellationToken);
        //
        // if (!isAdmin)
        //     return Forbid();

        var codes = Permissions.Select(permission => permission.Code).ToArray();
        var existingCodes = await context.ApplicationPermissions
            .AsNoTracking()
            .Where(permission => ((IEnumerable<string>)codes).Contains(permission.Code))
            .Select(permission => permission.Code)
            .ToListAsync(cancellationToken);
        var existing = existingCodes.ToHashSet(StringComparer.Ordinal);
        var missing = Permissions
            .Where(permission => !existing.Contains(permission.Code))
            .Select(permission => new ApplicationPermission
            {
                Code = permission.Code,
                Description = permission.Description,
                IsActive = true
            })
            .ToArray();

        if (missing.Length > 0)
        {
            context.ApplicationPermissions.AddRange(missing);
            try
            {
                await context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException exception) when (
                exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
            {
                return Conflict(new { Message = "Permissions were inserted concurrently. Retry the seed request." });
            }
        }

        return Ok(new
        {
            Total = Permissions.Length,
            Inserted = missing.Length,
            Skipped = existing.Count,
            InsertedCodes = missing.Select(permission => permission.Code).ToArray()
        });
    }
}

