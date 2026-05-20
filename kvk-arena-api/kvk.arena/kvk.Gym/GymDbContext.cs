using Microsoft.EntityFrameworkCore;
using kvk.Gym.Domain;

namespace kvk.Gym;

public class GymDbContext : DbContext
{
    public GymDbContext(DbContextOptions<GymDbContext> options) : base(options)
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
    }
}