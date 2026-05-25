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
    public DbSet<PaymentRecord> PaymentRecords { get; set; } = null!;
    public DbSet<MembershipPlan> MembershipPlans { get; set; } = null!;
    public DbSet<DayPassMember> DayPassMembers { get; set; } = null!;
    public DbSet<DayEndRecord> DayEnds { get; set; } = null!;

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

        modelBuilder.Entity<PaymentRecord>()
            .HasIndex(p => p.MembershipId)
            .HasDatabaseName("IX_PaymentRecord_MembershipId");

        modelBuilder.Entity<PaymentRecord>()
            .HasOne(p => p.Membership)
            .WithMany()
            .HasForeignKey(p => p.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure MemberPayment -> Membership with cascade delete so removing a Membership removes related payments.
        modelBuilder.Entity<MemberPayment>()
            .HasIndex(p => p.MembershipId)
            .HasDatabaseName("IX_MemberPayment_MembershipId");

        modelBuilder.Entity<MemberPayment>()
            .HasOne(p => p.Membership)
            .WithMany(m => m.MemberPayments)
            .HasForeignKey(p => p.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure MemberAttendance -> Membership with cascade delete so removing a Membership removes related attendances.
        modelBuilder.Entity<MemberAttendance>()
            .HasIndex(a => a.MembershipId)
            .HasDatabaseName("IX_MemberAttendance_MembershipId");

        modelBuilder.Entity<MemberAttendance>()
            .HasOne(a => a.Membership)
            .WithMany(m => m.MemberAttendances)
            .HasForeignKey(a => a.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);

        // DayEnd records for gym cash reconciliation
        modelBuilder.Entity<DayPassMember>(eb =>
        {
            eb.HasIndex(d => d.TemporaryMembershipNumber).HasDatabaseName("IX_DayPass_TempMembershipNumber");
            eb.HasOne(d => d.MembershipPlan)
                .WithMany()
                .HasForeignKey(d => d.MembershipPlanId);
        });

        modelBuilder.Entity<DayEndRecord>(eb =>
        {
            eb.HasIndex(d => d.CurrentDate).HasDatabaseName("IX_DayEnd_CurrentDate");
            eb.Property(d => d.Remark).IsRequired();
        });
    }
}