using kvk.Badminton.Domain;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace kvk.Badminton;

public class BadmintonDbContext(
    DbContextOptions<BadmintonDbContext> options,
    ITenantService tenantService,
    ILogger<AppDbContextBase> logger,
    IHttpContextAccessor? httpContextAccessor = null)
    : AppDbContextBase(options, tenantService, logger, httpContextAccessor)
{
    public DbSet<Domain.Court> Courts => Set<Domain.Court>();
    public DbSet<Domain.CourtSlotConfiguration> CourtSlotConfigurations => Set<Domain.CourtSlotConfiguration>();
    public DbSet<Domain.CourtSlot> CourtSlots => Set<Domain.CourtSlot>();
    public DbSet<Domain.CourtBooking> CourtBookings => Set<Domain.CourtBooking>();
    public DbSet<Domain.BookingHold> BookingHolds => Set<Domain.BookingHold>();
    public DbSet<Domain.BadmintonDayEnd> BadmintonDayEnds => Set<Domain.BadmintonDayEnd>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("badminton");

        base.OnModelCreating(modelBuilder);
        
        
        modelBuilder
            .Entity<BookingHold>()
            .Property(x => x.ExpiresAt)
            .HasColumnType("timestamp without time zone");


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BadmintonDbContext).Assembly);
        
  
    }
}