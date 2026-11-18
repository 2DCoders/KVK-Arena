using System.Security.Claims;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace kvk.SeedAndUnitTesting.Features.ApplicationPermissions;

[ApiController]
[Route("api/seed/application-permissions/gym")]
public class GymApplicationPermissionsSeedController(IdentityApplicationDbContext context) : ControllerBase
{
    // These codes mirror BackendDocs/Identity/GymApplicationPermissions.Md.
    private static readonly (string Code, string Description)[] Permissions =
    [
        ("KVK:Gym:Attendance:Create", "Record Gym attendance scans."),
        ("KVK:Gym:Dashboard:View", "View the Gym dashboard."),
        ("KVK:Gym:DayEnd:Create", "Create Gym day-end records."),
        ("KVK:Gym:DayEnd:View", "View Gym day-end records."),
        ("KVK:Gym:DayPassMember:Create", "Register Gym day-pass members."),
        ("KVK:Gym:DayPassMember:Edit", "Edit Gym day-pass members."),
        ("KVK:Gym:DayPassMember:View", "View Gym day-pass members."),
        ("KVK:Gym:DayPassMember:Delete", "Delete Gym day-pass members."),
        ("KVK:Gym:MembershipPlan:Create", "Create Gym membership plans."),
        ("KVK:Gym:MembershipPlan:View", "View Gym membership plans."),
        ("KVK:Gym:MembershipPlan:Edit", "Edit Gym membership plans."),
        ("KVK:Gym:MembershipPlan:Delete", "Delete Gym membership plans."),
        ("KVK:Gym:Membership:Create", "Register Gym members."),
        ("KVK:Gym:Membership:Edit", "Edit Gym members and upgrade membership plans."),
        ("KVK:Gym:Membership:View", "View Gym members."),
        ("KVK:Gym:Membership:Delete", "Soft-delete Gym members."),
        ("KVK:Gym:Membership:Manage", "Restore soft-deleted Gym members."),
        ("KVK:Gym:MembershipFingerprint:Edit", "Enroll or update Gym member fingerprints."),
        ("KVK:Gym:MembershipPermanentDeletion:Delete", "Permanently delete Gym members."),
        ("KVK:Gym:MembershipTrainer:Manage", "Assign trainers to Gym members."),
        ("KVK:Gym:Trainer:View", "View Gym trainers."),
        ("KVK:Gym:Payment:Create", "Record Gym member payments."),
        ("KVK:Gym:Payment:View", "View Gym member payments and payment reports."),
        ("KVK:Gym:PaymentGateway:Create", "Initiate Gym gateway payments."),
        ("KVK:Gym:PaymentGateway:Delete", "Cancel pending Gym gateway payments."),
        ("KVK:Gym:TrainerApprovalRequest:Create", "Create Gym trainer approval requests."),
        ("KVK:Gym:TrainerApprovalRequest:View", "View Gym trainer approval requests."),
        ("KVK:Gym:TrainerApprovalRequest:Edit", "Edit Gym trainer approval requests."),
        ("KVK:Gym:TrainerApprovalRequest:Delete", "Delete Gym trainer approval requests."),
        ("KVK:Gym:TrainerApprovalRequest:Manage", "Approve or reject Gym trainer approval requests.")
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
