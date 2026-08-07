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

    public DbSet<CarWashOrder> CarWashOrders => Set<CarWashOrder>();
    public DbSet<CarWashOrderPackage> CarWashOrderPackages => Set<CarWashOrderPackage>();

    public DbSet<CarWashOrderService> CarWashOrderServices => Set<CarWashOrderService>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("carService");

        base.OnModelCreating(modelBuilder);


        modelBuilder.Entity<CarWashOrder>(entity =>
        {
            entity.HasMany(e => e.Packages)
                .WithOne(e => e.CarWashOrder)
                .HasForeignKey(e => e.CarWashOrderId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Services)
                .WithOne(e => e.CarWashOrder)
                .HasForeignKey(e => e.CarWashOrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CarWashOrderService>()
            .HasOne(x => x.Service)
            .WithMany()
            .HasForeignKey(x => x.CarWashServiceId);

        modelBuilder.Entity<CarWashOrderPackage>()
            .HasOne(x => x.Package)
            .WithMany()
            .HasForeignKey(x => x.CarWashPackageId);


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CarServiceDbContext).Assembly);
    }
}