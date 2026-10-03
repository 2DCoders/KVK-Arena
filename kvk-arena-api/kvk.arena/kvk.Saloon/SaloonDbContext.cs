using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.Cafe.Domain;
using kvk.Saloon.Domain;
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
    public DbSet<Saloon> Saloons => Set<Saloon>();
    public DbSet<SaloonStaff> SaloonStaffs => Set<SaloonStaff>();
    public DbSet<SaloonService> SaloonServices => Set<SaloonService>();
    public DbSet<SaloonStaffService> SaloonStaffServices => Set<SaloonStaffService>();
    public DbSet<SaloonStaffSchedule> SaloonStaffSchedules => Set<SaloonStaffSchedule>();
    public DbSet<SaloonSlotConfiguration> SaloonSlotConfigurations => Set<SaloonSlotConfiguration>();
    public DbSet<SaloonBooking> SaloonBookings => Set<SaloonBooking>();
    public DbSet<SaloonBookingService> SaloonBookingServices => Set<SaloonBookingService>();
    public DbSet<SaloonDayEnd> SaloonDayEnds => Set<SaloonDayEnd>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("saloon");

        base.OnModelCreating(modelBuilder);
        


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SaloonDbContext).Assembly);
    }
}