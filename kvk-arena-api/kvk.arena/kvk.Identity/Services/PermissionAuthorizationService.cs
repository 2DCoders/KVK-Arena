using kvk.BuildingBlocks.Auth;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
namespace kvk.Identity.Services;
public sealed class PermissionAuthorizationService : IPermissionAuthorizationService
{
    private readonly IdentityApplicationDbContext _dbContext;
    public PermissionAuthorizationService(IdentityApplicationDbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }
    public async Task<IReadOnlyCollection<string>> GetUserPermissions(Guid userId, CancellationToken cancellationToken = default)
    {
        if (userId == Guid.Empty)
        {
            return Array.Empty<string>();
        }
        var permissions = await (
            from staffRole in _dbContext.StaffRoles
            join role in _dbContext.Roles on staffRole.RoleId equals role.Id
            join rolePermission in _dbContext.RolePermissions on role.Id equals rolePermission.RoleId
            join applicationPermission in _dbContext.ApplicationPermissions on rolePermission.Code equals applicationPermission.Code
            where staffRole.StaffId == userId
                && staffRole.IsActive
                && role.IsActive
                && rolePermission.IsActive
                && applicationPermission.IsActive
            select applicationPermission.Code)
            .Distinct()
            .ToListAsync(cancellationToken);
        return permissions;
    }
    public async Task<bool> HasPermission(Guid userId, string permissionCode, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(permissionCode) || userId == Guid.Empty)
        {
            return false;
        }
        var permissions = await GetUserPermissions(userId, cancellationToken);
        return permissions.Contains(permissionCode, StringComparer.Ordinal);
    }
}
