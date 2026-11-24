using System.Security.Claims;
using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Features;

internal static class GymAccess
{
    internal static bool IsStaff(this ClaimsPrincipal user) =>
        user.HasClaim("permission", ModuleConstants.GymStaffPermission);

    internal static bool CanAccessMember(this ClaimsPrincipal user, Guid memberId) =>
        user.IsStaff() || (memberId != Guid.Empty &&
            Guid.TryParse(user.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var userId) && userId == memberId);
}
