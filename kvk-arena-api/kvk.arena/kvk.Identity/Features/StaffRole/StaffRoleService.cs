using kvk.BuildingBlocks.Common;
using kvk.Identity.Domain;
using kvk.Identity.Features.Role;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Throw;

namespace kvk.Identity.Features.StaffRole;

public class StaffRoleService
{
    private readonly IdentityApplicationDbContext _context;

    public StaffRoleService(IdentityApplicationDbContext context)
    {
        _context = context;
    }


    public async Task<Result> AssignStaffMembersRoles(StaffRoleRequest request,
        CancellationToken cancellationToken)
    {
        var staff = await _context.Staffs
            .Where(x => x.Id == request.StaffId)
            .FirstOrDefaultAsync(cancellationToken);

        staff.ThrowIfNull("staff not found");

        var roles = await _context.Roles.Where(r => request.RoleIds.Contains(r.Id)).ToListAsync(cancellationToken);
        if (roles.Count != request.RoleIds.Count)
        {
            throw new Exception("One or more roles not found");
        }

        foreach (var role in roles)
        {
            var staffRole = new Domain.StaffRole
            {
                StaffId = staff.Id,
                RoleId = role.Id
            };
            _context.StaffRoles.Add(staffRole);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success("Success");
    }


    public async Task<StaffRolesResponse> GetStaffRoles(Guid staffId, CancellationToken cancellationToken)
    {
        var staff = await _context.Staffs
            .Where(x => x.Id == staffId)
            .FirstOrDefaultAsync(cancellationToken);

        staff.ThrowIfNull("staff not found");

        var roles = await _context.StaffRoles
            .Where(sr => sr.StaffId == staffId)
            .Include(sr => sr.Role)
            .Select(sr => new RolesResponse
            {
                RoleId = sr.RoleId,
                RoleName = sr.Role.Name
            })
            .ToListAsync(cancellationToken);


        var staffRoleResponses = new StaffRolesResponse
        {
            StaffId = staff.Id,
            StaffName = staff.UserName,
            RolesResponse = roles
        };
        

        return staffRoleResponses;
    }
    
    
    public class StaffRolesResponse
    {
        public Guid StaffId { get; set; }
        
        public required string StaffName { get; set; }
        
        public List<RolesResponse> RolesResponse { get; set; }
        
    }
    
    

    public class RolesResponse
    {
        public Guid RoleId { get; set; }

        public string RoleName { get; set; } = string.Empty;
    }
}