using kvk.BuildingBlocks.Common;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Throw;

namespace kvk.Identity.Features.Role;

/// <summary>
/// Service for managing roles (CRUD operations).
/// Roles are organizational units that contain permissions.
/// All operations return Result objects for consistent error handling.
/// </summary>
public class RoleService
{
    private readonly IdentityApplicationDbContext _db;

    public RoleService(IdentityApplicationDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    /// <summary>
    /// Create a new role.
    /// </summary>
    public async Task<Result> CreateAsync(RoleCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Role name is required");

        if (request.Name.Length > 100)
            return Result.Failure("Role name cannot exceed 100 characters");

        try
        {
            // Check for duplicate name
            var exists = await _db.Set<global::kvk.Identity.Domain.Role>()
                .AnyAsync(r => r.Name == request.Name, cancellationToken);
            if (exists)
                return Result.Failure("A role with this name already exists");

            var role = new global::kvk.Identity.Domain.Role
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = request.IsActive
            };

            _db.Set<global::kvk.Identity.Domain.Role>().Add(role);
            await _db.SaveChangesAsync(cancellationToken);

            var response = MapToResponse(role);
            return Result.Success($"Role '{role.Name}' created successfully")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create role: {ex.Message}");
        }
    }

    /// <summary>
    /// Get a role by ID.
    /// </summary>
    public async Task<Result> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Role ID cannot be empty");

        try
        {
            var role = await _db.Set<global::kvk.Identity.Domain.Role>()
                .AsNoTracking()
                .SingleOrDefaultAsync(r => r.Id == id, cancellationToken);

            if (role == null)
                return Result.Failure("Role not found");

            var response = MapToResponse(role);
            return Result.Success()
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to get role: {ex.Message}");
        }
    }

    /// <summary>
    /// Get all roles with optional filtering.
    /// </summary>
    public async Task<Result> GetAllAsync(bool? isActive = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _db.Set<global::kvk.Identity.Domain.Role>().AsNoTracking();

            if (isActive.HasValue)
                query = query.Where(r => r.IsActive == isActive.Value);

            var roles = await query
                .OrderBy(r => r.Name)
                .ToListAsync(cancellationToken);

            var responses = roles.Select(MapToResponse).ToArray();
            return Result.Success($"Retrieved {responses.Length} role(s)")
                .WithData("response", responses);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to get roles: {ex.Message}");
        }
    }

    /// <summary>
    /// Update an existing role.
    /// </summary>
    public async Task<Result> UpdateAsync(RoleUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.Id == Guid.Empty)
            return Result.Failure("Role ID cannot be empty");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Role name is required");

        if (request.Name.Length > 100)
            return Result.Failure("Role name cannot exceed 100 characters");

        try
        {
            var role = await _db.Set<global::kvk.Identity.Domain.Role>()
                .SingleOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

            if (role == null)
                return Result.Failure("Role not found");

            // Check for duplicate name (excluding current role)
            var isDuplicate = await _db.Set<global::kvk.Identity.Domain.Role>()
                .AnyAsync(r => r.Name == request.Name && r.Id != request.Id, cancellationToken);
            if (isDuplicate)
                return Result.Failure("A role with this name already exists");

            role.Name = request.Name;
            role.Description = request.Description;
            role.IsActive = request.IsActive;

            _db.Set<global::kvk.Identity.Domain.Role>().Update(role);
            await _db.SaveChangesAsync(cancellationToken);

            var response = MapToResponse(role);
            return Result.Success($"Role '{role.Name}' updated successfully")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update role: {ex.Message}");
        }
    }

    /// <summary>
    /// Delete a role by ID.
    /// </summary>
    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Role ID cannot be empty");

        try
        {
            var role = await _db.Set<global::kvk.Identity.Domain.Role>()
                .SingleOrDefaultAsync(r => r.Id == id, cancellationToken);

            if (role == null)
                return Result.Failure("Role not found");

            // Check if role is assigned to staff
            var hasStaffAssignments = await _db.Set<Domain.StaffRole>()
                .AnyAsync(sr => sr.RoleId == id, cancellationToken);
            if (hasStaffAssignments)
                return Result.Failure("Cannot delete role that is assigned to staff members");

            _db.Set<global::kvk.Identity.Domain.Role>().Remove(role);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success($"Role '{role.Name}' deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete role: {ex.Message}");
        }
    }


    /// <summary>
    /// Add Permissions to the Roles
    /// </summary>
    public async Task<Result> AssignPermissionsToRoleAsync(Guid roleId, List<string> permissionIds,
        CancellationToken cancellationToken = default)
    {
        
        try
        {
            var role = await _db.Roles
                .SingleOrDefaultAsync(r => r.Id == roleId, cancellationToken);

            role.ThrowIfNull($"Role with ID {roleId} not found");

            var permissions = await _db.ApplicationPermissions
                .Where(p => permissionIds.Contains(p.Code))
                .ToListAsync(cancellationToken);

            if (permissions.Count != permissionIds.Count)
                return Result.Failure("One or more permissions not found");

            //For After
            
            // Remove existing permissions
            // var existingPermissions = await _db.Set<RolePermission>()
            //     .Where(rp => rp.RoleId == roleId)
            //     .ToListAsync(cancellationToken);
            // _db.Set<RolePermission>().RemoveRange(existingPermissions);

            // Add new permissions
            foreach (var permission in permissions)
            {
                var rolePermission = new RolePermission
                {
                    RoleId = roleId,
                    Code = permission.Code,
                    IsActive = true
                };
                _db.RolePermissions.Add(rolePermission);
            }

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success($"Permissions assigned to role '{role.Name}' successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to assign permissions to role: {ex.Message}");
        }
    }
    
    /// <summary>
    /// Get Permissions to  the specific Role
    /// </summary>
    public async Task<PermissionsForTheRoleResponse> GetPermissionsForTheRoleAsync(Guid roleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var role = await _db.Roles
                .SingleOrDefaultAsync(r => r.Id == roleId, cancellationToken);

            role.ThrowIfNull($"Role with ID {roleId} not found");

            var permissions = await _db.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Select(rp => rp.Code)
                .ToListAsync(cancellationToken);

            return new PermissionsForTheRoleResponse
            {
                RoleId = roleId,
                RoleName = role.Name,
                Permissions = permissions
            };
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to get permissions for role: {ex.Message}", ex);
        }
    }


    /// <summary>
    /// Map Role entity to RoleResponse DTO.
    /// </summary>
    private static RoleResponse MapToResponse(global::kvk.Identity.Domain.Role role)
    {
        return new RoleResponse
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description,
            IsActive = role.IsActive,
            CreatedAt = role.CreatedAt,
            LastModifiedAt = role.LastModifiedAt
        };
    }
}

public class PermissionsForTheRoleResponse
{
    public Guid RoleId { get; set; }
    
    public string RoleName { get; set; }
    
    public List<string> Permissions { get; set; }
    
    
}


