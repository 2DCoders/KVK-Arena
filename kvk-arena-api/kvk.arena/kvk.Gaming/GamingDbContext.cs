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

    // public DbSet<GamingStationGame> GamingStationGames { get; set; } = null!;
    public DbSet<GamingSlotConfiguration> GamingSlotConfigurations { get; set; } = null!;
    public DbSet<GamingSlot> GamingSlots { get; set; } = null!;
    public DbSet<GamingBooking> GamingBookings { get; set; } = null!;
    public DbSet<GamingBookingHold> GamingBookingHolds { get; set; } = null!; // Added GamingBookingHold DbSet
    public DbSet<GamingBookingAdditionalPurchase> GamingBookingAdditionalPurchases { get; set; } = null!;
    public DbSet<GamingBookingHoldAdditionalPurchase> GamingBookingHoldAdditionalPurchases { get; set; } = null!;
    public DbSet<Domain.GamingDayEnd> GamingDayEnds => Set<Domain.GamingDayEnd>();
    public DbSet<AdditionalPurchase> AdditionalPurchases { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("game");

        base.OnModelCreating(modelBuilder);

        // // Configure GamingStationGame many-to-many relationship
        // modelBuilder.Entity<GamingStationGame>()
        //     .HasKey(gsg => new { gsg.GamingStationId, gsg.GameId });
        //
        // modelBuilder.Entity<GamingStationGame>()
        //     .HasOne(gsg => gsg.GamingStation)
        //     .WithMany()
        //     .HasForeignKey(gsg => gsg.GamingStationId);
        //
        // modelBuilder.Entity<GamingStationGame>()
        //     .HasOne(gsg => gsg.Game)
        //     .WithMany()
        //     .HasForeignKey(gsg => gsg.GameId);

        // Configure GamingSlot unique constraint
        modelBuilder.Entity<GamingSlot>()
            .HasIndex(gs => new { gs.GamingStationId, gs.StartTime })
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

        // Configure relationships for GamingBookingHold
        modelBuilder.Entity<GamingBookingHold>()
            .HasOne<GamingCategory>()
            .WithMany()
            .HasForeignKey(gbh => gbh.GamingCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GamingBookingHold>()
            .HasOne<GamingStation>()
            .WithMany()
            .HasForeignKey(gbh => gbh.GamingStationId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GamingBookingHold>()
            .HasOne<GamingSlot>()
            .WithMany()
            .HasForeignKey(gbh => gbh.GamingSlotId)
            .OnDelete(DeleteBehavior.Restrict);
       
        modelBuilder
            .Entity<GamingBookingHold>()
            .Property(x => x.ExpiresAt)
            .HasColumnType("timestamp without time zone");

        // Configure relationships for AdditionalPurchase
        modelBuilder.Entity<AdditionalPurchase>()
            .HasOne(ap => ap.GamingCategory)
            .WithMany(gc => gc.AdditionalPurchases)
            .HasForeignKey(ap => ap.GamingCategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure relationships for GamingBookingAdditionalPurchase
        modelBuilder.Entity<GamingBookingAdditionalPurchase>()
            .HasOne(gbap => gbap.GamingBooking)
            .WithMany(gb => gb.AdditionalPurchases)
            .HasForeignKey(gbap => gbap.GamingBookingId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<GamingBookingAdditionalPurchase>()
            .HasOne(gbap => gbap.AdditionalPurchase)
            .WithMany()
            .HasForeignKey(gbap => gbap.AdditionalPurchaseId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure relationships for GamingBookingHoldAdditionalPurchase
        modelBuilder.Entity<GamingBookingHoldAdditionalPurchase>()
            .HasOne(gbhap => gbhap.GamingBookingHold)
            .WithMany(gbh => gbh.AdditionalPurchases)
            .HasForeignKey(gbhap => gbhap.GamingBookingHoldId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<GamingBookingHoldAdditionalPurchase>()
            .HasOne(gbhap => gbhap.AdditionalPurchase)
            .WithMany()
            .HasForeignKey(gbhap => gbhap.AdditionalPurchaseId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GamingDbContext).Assembly);
    }
}