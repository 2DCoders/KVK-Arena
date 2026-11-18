using System.Security.Claims;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace kvk.SeedAndUnitTesting.Features.ApplicationPermissions;

[ApiController]
[Route("api/seed/application-permissions/financial")]
public class FinancialApplicationPermissionsSeedController(IdentityApplicationDbContext context) : ControllerBase
{
    // These codes mirror BackendDocs/Identity/FinancialApplicationPermissions.Md.
    private static readonly (string Code, string Description)[] Permissions =
    [
        ("KVK:Financial:BadmintonAnalytics:View", "View Badminton financial analytics for the requested date range."),
        ("KVK:Financial:CafeAnalytics:View", "View Cafe financial analytics for the requested date range."),
        ("KVK:Financial:CarServiceAnalytics:View", "View CarService financial analytics for the requested date range."),
        ("KVK:Financial:GamingAnalytics:View", "View Gaming financial analytics for the requested date range."),
        ("KVK:Financial:GymAnalytics:View", "View Gym financial analytics for the requested date range."),
        ("KVK:Financial:SaloonAnalytics:View", "View Saloon financial analytics for the requested date range.")
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


