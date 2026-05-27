using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Gym.Domain;

namespace kvk.Gym.Persistence.Configuration;

public class MemberPaymentConfiguration : IEntityTypeConfiguration<MemberPayment>
{
    public void Configure(EntityTypeBuilder<MemberPayment> builder)
    {
        builder.HasIndex(p => p.MembershipId)
            .HasDatabaseName("IX_MemberPayment_MembershipId");

        builder.HasOne(p => p.Membership)
            .WithMany(m => m.MemberPayments)
            .HasForeignKey(p => p.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

