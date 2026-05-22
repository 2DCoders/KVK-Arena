using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.Gym.Domain;

namespace kvk.Gym;

public class GymDbContext : AppDbContextBase
{
    public GymDbContext(
        DbContextOptions<GymDbContext> options,
        ITenantService tenantService,
        ILogger<AppDbContextBase> logger,
        IHttpContextAccessor? httpContextAccessor = null)
        : base(options, tenantService, logger, httpContextAccessor)
    {
    }

    public DbSet<Membership> Memberships { get; set; } = null!;
    public DbSet<MemberAttendance> MemberAttendances { get; set; } = null!;
    public DbSet<MemberPayment> MemberPayments { get; set; } = null!;
    public DbSet<MembershipPlan> MembershipPlans { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("gym");
        
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Membership>()
            .HasIndex(m => m.DeviceFingerprintId1)
            .HasDatabaseName("IX_Membership_DeviceFingerprint1");

        modelBuilder.Entity<Membership>()
            .HasIndex(m => m.DeviceFingerprintId2)
            .HasDatabaseName("IX_Membership_DeviceFingerprint2");

        // IdentityUserId is optional; index for lookups
        modelBuilder.Entity<Membership>()
            .HasIndex(m => m.IdentityUserId)
            .HasDatabaseName("IX_Membership_IdentityUserId");

        modelBuilder.Entity<Membership>()
            .HasOne(m => m.MembershipPlan)
            .WithMany()
            .HasForeignKey(m => m.MembershipPlanId);
        
        //email should be unique
        modelBuilder.Entity<Membership>()
            .HasIndex(m => m.Email)
            .IsUnique();
    }
}