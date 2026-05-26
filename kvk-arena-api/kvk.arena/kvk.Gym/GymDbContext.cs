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
    public DbSet<SystemSetting> SystemSettings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("gym");

        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GymDbContext).Assembly);
    }
}