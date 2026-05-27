using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Gym.Domain;

namespace kvk.Gym.Persistence.Configuration;

public class PaymentRecordConfiguration : IEntityTypeConfiguration<PaymentRecord>
{
    public void Configure(EntityTypeBuilder<PaymentRecord> builder)
    {
        builder.HasIndex(p => p.MembershipId)
            .HasDatabaseName("IX_PaymentRecord_MembershipId");

        builder.HasOne(p => p.Membership)
            .WithMany()
            .HasForeignKey(p => p.MembershipId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

