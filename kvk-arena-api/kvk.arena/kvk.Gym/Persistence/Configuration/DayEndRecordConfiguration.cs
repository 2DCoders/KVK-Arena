using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Gym.Domain;

namespace kvk.Gym.Persistence.Configuration;

public class DayEndRecordConfiguration : IEntityTypeConfiguration<DayEndRecord>
{
    public void Configure(EntityTypeBuilder<DayEndRecord> builder)
    {
        builder.HasIndex(d => d.CurrentDate)
            .HasDatabaseName("IX_DayEnd_CurrentDate");

        builder.Property(d => d.Remark)
            .IsRequired();
    }
}

