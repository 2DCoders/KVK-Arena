using System.Security.Claims;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace kvk.SeedAndUnitTesting.Features.ApplicationPermissions;

[ApiController]
[Route("api/seed/application-permissions/saloon")]
public class SaloonApplicationPermissionsSeedController(IdentityApplicationDbContext context) : ControllerBase
{
    // These codes mirror BackendDocs/Identity/SaloonApplicationPermissions.Md.
    private static readonly (string Code, string Description)[] Permissions =
    [
        ("KVK:Saloon:Booking:View", "List bookings using query filters. View a booking."),
        ("KVK:Saloon:Booking:Create", "Create a booking. Create a booking with payment initiation."),
        ("KVK:Saloon:BookingPayment:Delete", "Cancel pending payment; this is not a settled-payment refund."),
        ("KVK:Saloon:BookingAvailability:View", "Check booking availability. Check day availability."),
        ("KVK:Saloon:Booking:Edit", "Edit booking details."),
        ("KVK:Saloon:Booking:Delete", "Permanently delete a booking."),
        ("KVK:Saloon:DayEnd:Create", "Create DayEnd records."),
        ("KVK:Saloon:DayEnd:View", "View DayEnd records."),
        ("KVK:Saloon:Saloon:View", "View Saloon records."),
        ("KVK:Saloon:Saloon:Create", "Create Saloon records."),
        ("KVK:Saloon:Saloon:Edit", "Edit Saloon records."),
        ("KVK:Saloon:Saloon:Delete", "Delete Saloon records."),
        ("KVK:Saloon:ServiceItem:View", "View ServiceItem records."),
        ("KVK:Saloon:ServiceItem:Create", "Create ServiceItem records."),
        ("KVK:Saloon:ServiceItem:Edit", "Edit ServiceItem records."),
        ("KVK:Saloon:ServiceItem:Delete", "Delete ServiceItem records."),
        ("KVK:Saloon:Staff:View", "View Staff records."),
        ("KVK:Saloon:Staff:Create", "Create Staff records."),
        ("KVK:Saloon:Staff:Edit", "Edit Staff records."),
        ("KVK:Saloon:Staff:Delete", "Delete Staff records."),
        ("KVK:Saloon:StaffSchedule:View", "View StaffSchedule records."),
        ("KVK:Saloon:StaffSchedule:Create", "Create StaffSchedule records."),
        ("KVK:Saloon:StaffSchedule:Edit", "Edit StaffSchedule records."),
        ("KVK:Saloon:StaffSchedule:Delete", "Delete StaffSchedule records.")
    ];

    [HttpPost]
    public async Task<IActionResult> Seed(CancellationToken cancellationToken = default)
    {
        var userIdClaim = User.FindFirst("UserId")?.Value
            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var staffId) || staffId == Guid.Empty)
            return Forbid();

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


