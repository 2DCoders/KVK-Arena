using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.CarService.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace kvk.CarService;

public class CarServiceDbContext(
    DbContextOptions<CarServiceDbContext> options,
    ITenantService tenantService,
    ILogger<AppDbContextBase> logger,
    IHttpContextAccessor? httpContextAccessor = null)
    : AppDbContextBase(options, tenantService, logger, httpContextAccessor)
{
  
    // public DbSet<CarServiceDayEnd> CarServiceDayEnds => Set<CarServiceDayEnd>();
    
    public DbSet<CarService.Domain.CarService> Services => Set<CarService.Domain.CarService>();
    public DbSet<Package> Packages => Set<Package>();
    public DbSet<PackageService> PackageServices => Set<PackageService>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("carService");

        base.OnModelCreating(modelBuilder);

      


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CarServiceDbContext).Assembly);
    }
}