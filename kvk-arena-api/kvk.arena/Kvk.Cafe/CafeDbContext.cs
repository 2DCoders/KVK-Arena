using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.Cafe.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kvk.Cafe;

public class CafeDbContext(
    DbContextOptions<CafeDbContext> options,
    ITenantService tenantService,
    ILogger<AppDbContextBase> logger,
    IHttpContextAccessor? httpContextAccessor = null)
    : AppDbContextBase(options, tenantService, logger, httpContextAccessor)
{ 
    public DbSet<CafeDayEnd> CafeDayEnds => Set<CafeDayEnd>();
    public DbSet<Menu> Menus => Set<Menu>();
    


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("cafe");

        base.OnModelCreating(modelBuilder);
        


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CafeDbContext).Assembly);
    }
}