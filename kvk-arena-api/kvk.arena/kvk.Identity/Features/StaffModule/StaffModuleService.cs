using kvk.BuildingBlocks.Common;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using kvk.Identity.Services;
using Microsoft.EntityFrameworkCore;

namespace kvk.Identity.Features.StaffModule;

/// <summary>
/// Service for managing staff module assignments.
/// </summary>
public class StaffModuleService
{
    private readonly IdentityApplicationDbContext _db;
    private readonly IdentitySeeder _seeder;
    private readonly kvk.BuildingBlocks.Interfaces.IModuleIntegratorClient _integrator;

    public StaffModuleService(
        IdentityApplicationDbContext db,
        IdentitySeeder seeder,
        kvk.BuildingBlocks.Interfaces.IModuleIntegratorClient integrator)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _seeder = seeder ?? throw new ArgumentNullException(nameof(seeder));
        _integrator = integrator ?? throw new ArgumentNullException(nameof(integrator));
    }

    /// <summary>
    /// Get all available module names that can be assigned to staff.
    /// </summary>
    public string[] GetAvailableModules()
    {
        var modules = new[]
        {
            ModuleConstants.Gym,
            ModuleConstants.CarWash,
            ModuleConstants.BadmintonCourt,
            ModuleConstants.GamingCenter,
            ModuleConstants.Retail
        };
        return modules;
    }

    /// <summary>
    /// Assign modules to a staff member.
    /// </summary>
    public async Task<StaffModuleResponse> AssignModulesToStaffAsync(
        Guid staffId,
        string[] moduleNames,
        CancellationToken cancellationToken = default)
    {
        if (staffId == Guid.Empty)
            throw new ArgumentException("Staff ID cannot be empty", nameof(staffId));

        if (moduleNames == null || moduleNames.Length == 0)
            throw new ArgumentException("At least one module must be provided", nameof(moduleNames));

        try
        {
            // Verify staff exists
            var staff = await _db.Set<Staff>()
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Id == staffId, cancellationToken);

            if (staff == null)
                throw new InvalidOperationException($"Staff member with ID {staffId} not found");

            // Validate module names
            var availableModules = GetAvailableModules();
            var invalidModules = moduleNames.Except(availableModules).ToList();
            if (invalidModules.Any())
                throw new ArgumentException(
                    $"Invalid module names: {string.Join(", ", invalidModules)}. Available: {string.Join(", ", availableModules)}",
                    nameof(moduleNames));

            // Assign modules
            foreach (var moduleName in moduleNames)
            {
                await _seeder.AssignModuleToStaffAsync(staffId, moduleName, cancellationToken);
            }

            // Get updated modules list
            var assignedModules = await _seeder.GetStaffModulesAsync(staffId, cancellationToken);

            // Publish integrator event for other modules (e.g., Gym) to react to
            var evt = new kvk.BuildingBlocks.Interfaces.StaffAssignedToModuleEvent
            {
                IdentityUserId = staff.Id.ToString(),
                Email = staff.Email,
                FullName = $"{staff.FirstName} {staff.LastName}",
                AssignedModules = assignedModules.ToArray(),
                Timestamp = DateTime.UtcNow
            };

            // Fire-and-forget is acceptable; integrator will call handlers in-process
            await _integrator.PublishStaffAssignedToModuleAsync(evt, cancellationToken);

            return new StaffModuleResponse
            {
                StaffId = staffId,
                AssignedModules = assignedModules.ToArray(),
                LastModified = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to assign modules to staff {staffId}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Get modules assigned to a staff member.
    /// </summary>
    public async Task<StaffModuleResponse> GetStaffModulesAsync(
        Guid staffId,
        CancellationToken cancellationToken = default)
    {
        if (staffId == Guid.Empty)
            throw new ArgumentException("Staff ID cannot be empty", nameof(staffId));

        try
        {
            var staff = await _db.Set<Staff>()
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Id == staffId, cancellationToken);

            if (staff == null)
                throw new InvalidOperationException($"Staff member with ID {staffId} not found");

            var assignedModules = await _seeder.GetStaffModulesAsync(staffId, cancellationToken);

            return new StaffModuleResponse
            {
                StaffId = staffId,
                AssignedModules = assignedModules.ToArray(),
                LastModified = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to get modules for staff {staffId}: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Remove a module from a staff member.
    /// </summary>
    public async Task<StaffModuleResponse> RevokeModuleFromStaffAsync(
        Guid staffId,
        string moduleName,
        CancellationToken cancellationToken = default)
    {
        if (staffId == Guid.Empty)
            throw new ArgumentException("Staff ID cannot be empty", nameof(staffId));

        if (string.IsNullOrWhiteSpace(moduleName))
            throw new ArgumentException("Module name cannot be empty", nameof(moduleName));

        try
        {
            var staff = await _db.Set<Staff>()
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Id == staffId, cancellationToken);

            if (staff == null)
                throw new InvalidOperationException($"Staff member with ID {staffId} not found");

            await _seeder.RevokeModuleFromStaffAsync(staffId, moduleName, cancellationToken);

            // Get updated modules list
            var assignedModules = await _seeder.GetStaffModulesAsync(staffId, cancellationToken);

            return new StaffModuleResponse
            {
                StaffId = staffId,
                AssignedModules = assignedModules.ToArray(),
                LastModified = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to revoke module from staff {staffId}: {ex.Message}", ex);
        }
    }
}