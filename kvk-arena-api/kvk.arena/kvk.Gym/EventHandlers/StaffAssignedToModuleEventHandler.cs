using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Common;

namespace kvk.Gym.EventHandlers;

public class StaffAssignedToModuleEventHandler : IStaffAssignedToModuleEventHandler
{
    private readonly kvk.Gym.Interfaces.IMembershipService _membershipService;

    public StaffAssignedToModuleEventHandler(kvk.Gym.Interfaces.IMembershipService membershipService)
    {
        _membershipService = membershipService ?? throw new ArgumentNullException(nameof(membershipService));
    }

    public async Task HandleAsync(StaffAssignedToModuleEvent evt, CancellationToken cancellationToken = default)
    {
        if (evt == null)
            return;

        if (evt.AssignedModules?.Any(m => m == ModuleConstants.Gym) ?? false)
        {
            // Ensure membership for staff (idempotent)
            await _membershipService.EnsureMembershipForStaffAsync(evt.IdentityUserId, evt.Email ?? string.Empty, evt.FullName ?? string.Empty, cancellationToken);
        }
    }
}

