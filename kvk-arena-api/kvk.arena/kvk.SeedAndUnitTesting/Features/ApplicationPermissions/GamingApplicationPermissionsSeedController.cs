using System.Security.Claims;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace kvk.SeedAndUnitTesting.Features.ApplicationPermissions;

[ApiController]
[Route("api/seed/application-permissions/gaming")]
public class GamingApplicationPermissionsSeedController(IdentityApplicationDbContext context) : ControllerBase
{
    // These codes mirror BackendDocs/Identity/GamingApplicationPermissions.Md.
    private static readonly (string Code, string Description)[] Permissions =
    [
        ("KVK:Gaming:AdditionalPurchase:Create", "Create AdditionalPurchase records."),
        ("KVK:Gaming:AdditionalPurchase:Edit", "Edit AdditionalPurchase records."),
        ("KVK:Gaming:AdditionalPurchase:View", "View AdditionalPurchase records."),
        ("KVK:Gaming:AdditionalPurchase:Delete", "Delete AdditionalPurchase records."),
        ("KVK:Gaming:AdditionalPurchase:Manage", "Activate AdditionalPurchase records. Deactivate AdditionalPurchase records."),
        ("KVK:Gaming:DayEnd:Create", "Create DayEnd records."),
        ("KVK:Gaming:DayEnd:View", "View DayEnd records."),
        ("KVK:Gaming:Game:Create", "Create Game records."),
        ("KVK:Gaming:Game:Edit", "Edit Game records."),
        ("KVK:Gaming:Game:View", "View Game records."),
        ("KVK:Gaming:Game:Manage", "Activate Game records. Deactivate Game records. DELETE currently calls DeactivateAsync; use Manage for the actual deactivation behavior."),
        ("KVK:Gaming:Booking:Create", "Create a gaming booking. Create a booking with payment initiation."),
        ("KVK:Gaming:BookingHold:Create", "Reserve multiple gaming slots."),
        ("KVK:Gaming:BookingPayment:Create", "Initiate payment for an existing batch of holds."),
        ("KVK:Gaming:BookingPayment:Edit", "Confirm a held booking and record payment. Confirm multiple held bookings and record payments."),
        ("KVK:Gaming:Booking:Delete", "Cancel a booking by changing its status; does not remove the record."),
        ("KVK:Gaming:Booking:View", "View a booking. List bookings using query filters. List bookings for a station. List bookings for a customer."),
        ("KVK:Gaming:BookingMaintenance:Manage", "Repair stale pending booking records."),
        ("KVK:Gaming:BookingPayment:Delete", "Cancel pending payment; this is not a settled-payment refund."),
        ("KVK:Gaming:GamingCategory:Create", "Create GamingCategory records."),
        ("KVK:Gaming:GamingCategory:Edit", "Edit GamingCategory records."),
        ("KVK:Gaming:GamingCategory:View", "View GamingCategory records."),
        ("KVK:Gaming:GamingCategory:Delete", "Delete GamingCategory records."),
        ("KVK:Gaming:GamingCategory:Manage", "Activate GamingCategory records. Deactivate GamingCategory records."),
        ("KVK:Gaming:GamingSlotGeneration:Create", "Generate slots for a gaming category."),
        ("KVK:Gaming:GamingSlotGeneration:Edit", "Edit slot generation configuration."),
        ("KVK:Gaming:GamingSlotGeneration:Delete", "Delete slot generation configuration."),
        ("KVK:Gaming:BookingAvailability:View", "View availability by stationId, categoryId and date."),
        ("KVK:Gaming:GamingSlotGeneration:View", "View slot configuration by categoryId."),
        ("KVK:Gaming:GamingStation:Create", "Create GamingStation records."),
        ("KVK:Gaming:GamingStation:Edit", "Edit GamingStation records."),
        ("KVK:Gaming:GamingStation:View", "View GamingStation records."),
        ("KVK:Gaming:GamingStation:Delete", "Delete GamingStation records."),
        ("KVK:Gaming:GamingStation:Manage", "Activate GamingStation records. Deactivate GamingStation records.")
    ];

    [HttpPost]
    public async Task<IActionResult> Seed(CancellationToken cancellationToken = default)
    {
        // var userIdClaim = User.FindFirst("UserId")?.Value
        //     ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        // if (!Guid.TryParse(userIdClaim, out var staffId) || staffId == Guid.Empty)
        //     return Forbid();
        //
        // // Bootstrap authorization must not depend on permissions that have not been seeded yet.
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


