using kvk.Identity.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kvk.Identity.Persistence.Configuration;

public class MemberEligibleOfferConfiguration : IEntityTypeConfiguration<MemberEligibleOffer>
{
    public void Configure(EntityTypeBuilder<MemberEligibleOffer> builder)
    {
        builder.HasOne(x => x.Member)
            .WithMany(x => x.EligibleOffers)
            .HasForeignKey(x => x.MemberId)
            .OnDelete(DeleteBehavior.Cascade);


        builder.HasOne(x => x.OfferRate)
            .WithMany(x => x.EligibleOffers)
            .HasForeignKey(x => x.OfferRateId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}