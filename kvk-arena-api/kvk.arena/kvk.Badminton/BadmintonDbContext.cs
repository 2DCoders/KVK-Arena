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
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<CourtSlotConfiguration> CourtSlotConfigurations => Set<Domain.CourtSlotConfiguration>();
    public DbSet<CourtSlot> CourtSlots => Set<Domain.CourtSlot>();
    public DbSet<CourtBooking> CourtBookings => Set<Domain.CourtBooking>();
    public DbSet<BookingHold> BookingHolds => Set<Domain.BookingHold>();
    public DbSet<BadmintonDayEnd> BadmintonDayEnds => Set<Domain.BadmintonDayEnd>();
    
    public DbSet<CourtBookingTemporary> CourtBookingTemporaries => Set<Domain.CourtBookingTemporary>();
    public DbSet<CourtBookingTemporarySchedule> CourtBookingTemporarySchedules => Set<Domain.CourtBookingTemporarySchedule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("badminton");

        base.OnModelCreating(modelBuilder);
        
        
        modelBuilder
            .Entity<BookingHold>()
            .Property(x => x.ExpiresAt)
            .HasColumnType("timestamp without time zone");


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(BadmintonDbContext).Assembly);
        
        modelBuilder.Entity<CourtBookingTemporarySchedule>()
            .Property(x => x.DayOfWeek)
            .HasConversion<string>();
    }
}