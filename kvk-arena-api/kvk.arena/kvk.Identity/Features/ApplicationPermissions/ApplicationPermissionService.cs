using kvk.BuildingBlocks.Common;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;

namespace kvk.Identity.Features.ApplicationPermissions;

public class ApplicationPermissionService(IdentityApplicationDbContext context)
{
    private readonly IdentityApplicationDbContext _context = context;


    public async Task<Result> CreateApplicationPermission(ApplicationPermissionRequest request,
        CancellationToken cancellationToken)
    {
        var existed = await _context.ApplicationPermissions
            .Where(x => x.Code == request.Code)
            .FirstOrDefaultAsync(cancellationToken);

        if (existed != null)
            return Result.Failure("Application permission already exists");


        var newRecord = new ApplicationPermission
        {
            Code = request.Code,
            Description = request.Description,
            IsActive = true
        };

        _context.ApplicationPermissions.Add(newRecord);
        await _context.SaveChangesAsync(cancellationToken);


        return Result.Success("Permission created successfully");
    }

    public async Task<List<ApplicationPermissionResponse>> GetApplicationPermissions(CancellationToken cancellationToken)
    {

        var records = await _context.ApplicationPermissions
            .Select(x=> new ApplicationPermissionResponse
            {
                Code = x.Code,
                Description = x.Description,
                IsActive = x.IsActive
            })
            .ToListAsync(cancellationToken);

        return records;
    }
}