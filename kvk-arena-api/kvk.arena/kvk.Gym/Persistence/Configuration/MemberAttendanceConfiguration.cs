using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Gym.Domain;

namespace kvk.Gym.Persistence.Configuration;

public class MemberAttendanceConfiguration : IEntityTypeConfiguration<MemberAttendance>
{
    public void Configure(EntityTypeBuilder<MemberAttendance> builder)
    {
        builder.HasIndex(a => a.MembershipId)
            .HasDatabaseName("IX_MemberAttendance_MembershipId");

        builder.HasOne(a => a.Membership)
            .WithMany(m => m.MemberAttendances)
            .HasForeignKey(a => a.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

