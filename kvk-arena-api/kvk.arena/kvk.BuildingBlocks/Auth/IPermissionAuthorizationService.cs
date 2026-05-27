namespace kvk.BuildingBlocks.Auth;

/// <summary>
/// Resolves permission codes for a staff user.
/// </summary>
public interface IPermissionAuthorizationService
{
    Task<IReadOnlyCollection<string>> GetUserPermissions(Guid userId, CancellationToken cancellationToken = default);

    Task<bool> HasPermission(Guid userId, string permissionCode, CancellationToken cancellationToken = default);
}

