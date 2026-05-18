using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
namespace kvk.BuildingBlocks.Auth;
public sealed class PermissionAuthorizationFilter : IAsyncAuthorizationFilter
{
    private readonly string _permissionCode;
    private readonly IPermissionAuthorizationService _permissionAuthorizationService;
    public PermissionAuthorizationFilter(
        string permissionCode,
        IPermissionAuthorizationService permissionAuthorizationService)
    {
        _permissionCode = permissionCode ?? throw new ArgumentNullException(nameof(permissionCode));
        _permissionAuthorizationService = permissionAuthorizationService ?? throw new ArgumentNullException(nameof(permissionAuthorizationService));
    }
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (context.HttpContext.User?.Identity?.IsAuthenticated != true)
        {
            context.Result = new ForbidResult();
            return;
        }
        if (!TryGetUserId(context.HttpContext.User, out var userId))
        {
            context.Result = new ForbidResult();
            return;
        }
        var hasPermission = await _permissionAuthorizationService.HasPermission(
            userId,
            _permissionCode,
            context.HttpContext.RequestAborted);
        if (!hasPermission)
        {
            context.Result = new ForbidResult();
        }
    }
    private static bool TryGetUserId(ClaimsPrincipal user, out Guid userId)
    {
        var userIdClaim = user.FindFirst("UserId")?.Value
            ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out userId);
    }
}
