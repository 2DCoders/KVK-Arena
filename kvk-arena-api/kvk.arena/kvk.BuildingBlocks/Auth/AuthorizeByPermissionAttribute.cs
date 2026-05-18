using Microsoft.AspNetCore.Mvc;
namespace kvk.BuildingBlocks.Auth;
/// <summary>
/// Authorizes endpoint access by a required permission code.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public sealed class AuthorizeByPermissionAttribute : TypeFilterAttribute
{
    public AuthorizeByPermissionAttribute(string permissionCode)
        : base(typeof(PermissionAuthorizationFilter))
    {
        if (string.IsNullOrWhiteSpace(permissionCode))
        {
            throw new ArgumentException("Permission code cannot be empty.", nameof(permissionCode));
        }
        Arguments = new object[] { permissionCode };
    }
}
