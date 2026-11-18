using System.Security.Claims;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace kvk.SeedAndUnitTesting.Features.ApplicationPermissions;

[ApiController]
[Route("api/seed/application-permissions/cafe")]
public class CafeApplicationPermissionsSeedController(IdentityApplicationDbContext context) : ControllerBase
{
    // These codes mirror BackendDocs/Identity/CafeApplicationPermissions.Md.
    private static readonly (string Code, string Description)[] Permissions =
    [
        ("KVK:Cafe:DayEnd:Create", "Create DayEnd records."),
        ("KVK:Cafe:DayEnd:View", "View DayEnd records."),
        ("KVK:Cafe:Menu:Create", "Create Menu records."),
        ("KVK:Cafe:Menu:Edit", "Edit Menu records."),
        ("KVK:Cafe:Menu:Delete", "Delete Menu records."),
        ("KVK:Cafe:Menu:View", "View Menu records."),
        ("KVK:Cafe:Order:Create", "Create Order records."),
        ("KVK:Cafe:Order:Edit", "Edit Order records."),
        ("KVK:Cafe:Order:Delete", "Delete Order records."),
        ("KVK:Cafe:Order:View", "View Order records."),
        ("KVK:Cafe:PaymentGateway:Create", "Initiate a Cafe gateway payment."),
        ("KVK:Cafe:PaymentGateway:Delete", "Cancel pending Cafe gateway payment.")
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


