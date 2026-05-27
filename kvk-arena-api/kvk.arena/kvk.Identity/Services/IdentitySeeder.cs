using kvk.BuildingBlocks.Common;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace kvk.Identity.Services;

/// <summary>
/// Seeding service for Identity module default data initialization.
/// Ensures default modules are available for staff assignment.
/// </summary>
public class IdentitySeeder
{
    private readonly IdentityApplicationDbContext _db;

    public IdentitySeeder(IdentityApplicationDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    /// <summary>
    /// Ensure all default modules are available for staff assignment.
    /// </summary>
    public async Task SeedDefaultModulesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var moduleNames = new[] 
            { 
                ModuleConstants.Gym, 
                ModuleConstants.CarWash, 
                ModuleConstants.BadmintonCourt, 
                ModuleConstants.GamingCenter, 
                ModuleConstants.Retail 
            };

            foreach (var moduleName in moduleNames)
            {
                // Note: Modules are used directly as strings in StaffModule assignments.
                // No separate module master table is required.
            }

            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to seed default modules: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Assign a module to a specific staff member (for testing/setup).
    /// </summary>
    public async Task<bool> AssignModuleToStaffAsync(
        Guid staffId, 
        string moduleName, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Verify staff exists
            var staff = await _db.Set<Staff>()
                .AsNoTracking()
                .SingleOrDefaultAsync(s => s.Id == staffId, cancellationToken);

            if (staff == null)
                return false;

            // Check if assignment already exists
            var exists = await _db.Set<StaffModule>()
                .AnyAsync(sm => sm.StaffId == staffId && sm.ModuleName == moduleName, cancellationToken);

            if (exists)
                return true; // Already assigned

            // Create new assignment
            var staffModule = new StaffModule
            {
                StaffId = staffId,
                ModuleName = moduleName,
                IsActive = true
            };

            _db.Set<StaffModule>().Add(staffModule);
            await _db.SaveChangesAsync(cancellationToken);

            return true;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to assign module '{moduleName}' to staff '{staffId}': {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Assign multiple modules to a staff member.
    /// </summary>
    public async Task AssignModulesToStaffAsync(
        Guid staffId,
        IEnumerable<string> moduleNames,
        CancellationToken cancellationToken = default)
    {
        try
        {
            foreach (var moduleName in moduleNames)
            {
                await AssignModuleToStaffAsync(staffId, moduleName, cancellationToken);
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to assign modules to staff '{staffId}': {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Get all assigned modules for a staff member.
    /// </summary>
    public async Task<IReadOnlyList<string>> GetStaffModulesAsync(
        Guid staffId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var modules = await _db.Set<StaffModule>()
                .AsNoTracking()
                .Where(sm => sm.StaffId == staffId && sm.IsActive)
                .Select(sm => sm.ModuleName)
                .OrderBy(m => m)
                .ToListAsync(cancellationToken);

            return modules.AsReadOnly();
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to get modules for staff '{staffId}': {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Revoke module access from a staff member.
    /// </summary>
    public async Task<bool> RevokeModuleFromStaffAsync(
        Guid staffId,
        string moduleName,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var staffModule = await _db.Set<StaffModule>()
                .SingleOrDefaultAsync(
                    sm => sm.StaffId == staffId && sm.ModuleName == moduleName,
                    cancellationToken);

            if (staffModule == null)
                return false;

            _db.Set<StaffModule>().Remove(staffModule);
            await _db.SaveChangesAsync(cancellationToken);

            return true;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to revoke module '{moduleName}' from staff '{staffId}': {ex.Message}", ex);
        }
    }
}


