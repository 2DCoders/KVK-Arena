using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Gym.Domain;

namespace kvk.Gym.Persistence.Configuration;

public class DayPassMemberConfiguration : IEntityTypeConfiguration<DayPassMember>
{
    public void Configure(EntityTypeBuilder<DayPassMember> builder)
    {
        builder.HasIndex(d => d.TemporaryMembershipNumber)
            .HasDatabaseName("IX_DayPass_TempMembershipNumber");

        builder.HasOne(d => d.MembershipPlan)
            .WithMany()
            .HasForeignKey(d => d.MembershipPlanId);
    }
}

