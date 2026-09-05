using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.Cafe.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Kvk.Cafe;

public class SaloonDbContext(
    DbContextOptions<SaloonDbContext> options,
    ITenantService tenantService,
    ILogger<AppDbContextBase> logger,
    IHttpContextAccessor? httpContextAccessor = null)
    : AppDbContextBase(options, tenantService, logger, httpContextAccessor)
{ 
    public DbSet<SaloonDayEnd> SaloonDayEnds => Set<SaloonDayEnd>();
    


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("saloon");

        base.OnModelCreating(modelBuilder);
        


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SaloonDbContext).Assembly);
    }
}