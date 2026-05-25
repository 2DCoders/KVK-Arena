using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Gym.Domain;

namespace kvk.Gym.Persistence.Configuration;

public class MembershipConfiguration : IEntityTypeConfiguration<Membership>
{
    public void Configure(EntityTypeBuilder<Membership> builder)
    {
        builder.HasIndex(m => m.DeviceFingerprintId1)
            .HasDatabaseName("IX_Membership_DeviceFingerprint1");

        builder.HasIndex(m => m.DeviceFingerprintId2)
            .HasDatabaseName("IX_Membership_DeviceFingerprint2");

        builder.HasIndex(m => m.IdentityUserId)
            .HasDatabaseName("IX_Membership_IdentityUserId");

        builder.HasOne(m => m.MembershipPlan)
            .WithMany()
            .HasForeignKey(m => m.MembershipPlanId);

        builder.HasIndex(m => m.Email)
            .IsUnique();
    }
}

