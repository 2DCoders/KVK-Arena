using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.Identity.Domain;
using kvk.BuildingBlocks.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace kvk.Identity.Persistence;

public class IdentityApplicationDbContext : AppDbContextBase
{
    public IdentityApplicationDbContext(
        DbContextOptions<IdentityApplicationDbContext> options,
        ITenantService tenantService,
        ILogger<AppDbContextBase> logger,
        IHttpContextAccessor? httpContextAccessor = null)
        : base(options, tenantService, logger, httpContextAccessor)
    {
    }

    public DbSet<Staff> Staffs => Set<Staff>();

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<ApplicationPermission> ApplicationPermissions => Set<ApplicationPermission>();

    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();

    public DbSet<StaffRole> StaffRoles => Set<StaffRole>();

    public DbSet<StaffModule> StaffModules => Set<StaffModule>();
    
    public DbSet<CalenderHolidays> CalenderHolidays => Set<CalenderHolidays>();
    
    public DbSet<KvkMember> KvkMembers => Set<KvkMember>();
    
    public DbSet<MemberEligibleOffer> MemberEligibleOffers => Set<MemberEligibleOffer>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Ensure Identity module tables are created in the "identity" schema.
        // Set the default schema before calling base so any model discovery / configuration
        // in the base class will see the intended schema.
        modelBuilder.HasDefaultSchema("identity");

        base.OnModelCreating(modelBuilder);

        // Apply configurations from separate configuration classes
        modelBuilder.ApplyConfiguration(new Configuration.StaffConfiguration());
        modelBuilder.ApplyConfiguration(new Configuration.RoleConfiguration());
        modelBuilder.ApplyConfiguration(new Configuration.ApplicationPermissionConfiguration());
        modelBuilder.ApplyConfiguration(new Configuration.RolePermissionConfiguration());
        modelBuilder.ApplyConfiguration(new Configuration.StaffRoleConfiguration());
        modelBuilder.ApplyConfiguration(new Configuration.StaffModuleConfiguration());
    }
    
}
