using kvk.Identity.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kvk.Identity.Persistence.Configuration;

public class KvkMemberConfiguration : IEntityTypeConfiguration<KvkMember>
{
    public void Configure(EntityTypeBuilder<KvkMember> builder)
    {
              
        builder
            .Property(x => x.StartDate)
            .HasColumnType("timestamp without time zone");
        
        
        builder
            .Property(x => x.EndDate)
            .HasColumnType("timestamp without time zone");
    }
}