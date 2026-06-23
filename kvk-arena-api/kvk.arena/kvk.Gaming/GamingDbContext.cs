using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.Gaming.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace kvk.Gaming;

public class GamingDbContext(
    DbContextOptions<GamingDbContext> options,
    ITenantService tenantService,
    ILogger<AppDbContextBase> logger,
    IHttpContextAccessor? httpContextAccessor = null)
    : AppDbContextBase(options, tenantService, logger, httpContextAccessor)
{
    public DbSet<GamingCategory> GamingCategories { get; set; } = null!;
    public DbSet<GamingStation> GamingStations { get; set; } = null!;
    public DbSet<Game> Games { get; set; } = null!;
    public DbSet<GamingStationGame> GamingStationGames { get; set; } = null!;
    public DbSet<GamingSlotConfiguration> GamingSlotConfigurations { get; set; } = null!;
    public DbSet<GamingSlot> GamingSlots { get; set; } = null!;
    public DbSet<GamingBooking> GamingBookings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("game");

        base.OnModelCreating(modelBuilder);

        // Configure GamingStationGame many-to-many relationship
        modelBuilder.Entity<GamingStationGame>()
            .HasKey(gsg => new { gsg.GamingStationId, gsg.GameId });

        modelBuilder.Entity<GamingStationGame>()
            .HasOne(gsg => gsg.GamingStation)
            .WithMany()
            .HasForeignKey(gsg => gsg.GamingStationId);

        modelBuilder.Entity<GamingStationGame>()
            .HasOne(gsg => gsg.Game)
            .WithMany()
            .HasForeignKey(gsg => gsg.GameId);

        // Configure GamingSlot unique constraint
        modelBuilder.Entity<GamingSlot>()
            .HasIndex(gs => new { gs.GamingStationId, gs.Date, gs.StartTime })
            .IsUnique();
            
        // Configure GamingBooking unique constraint for BookingNumber
        modelBuilder.Entity<GamingBooking>()
            .HasIndex(gb => gb.BookingNumber)
            .IsUnique();

        // Configure relationships for GamingBooking
        modelBuilder.Entity<GamingBooking>()
            .HasOne(gb => gb.GamingCategory)
            .WithMany()
            .HasForeignKey(gb => gb.GamingCategoryId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        modelBuilder.Entity<GamingBooking>()
            .HasOne(gb => gb.GamingStation)
            .WithMany()
            .HasForeignKey(gb => gb.GamingStationId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        modelBuilder.Entity<GamingBooking>()
            .HasOne(gb => gb.GamingSlot)
            .WithMany()
            .HasForeignKey(gb => gb.GamingSlotId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        modelBuilder.Entity<GamingBooking>()
            .HasOne(gb => gb.Game)
            .WithMany()
            .HasForeignKey(gb => gb.GameId)
            .IsRequired(false) // GameId is nullable
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GamingDbContext).Assembly);
    }
}