using kvk.Badminton.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kvk.Badminton.Persistence.Configuration;

public class CourtConfiguration : IEntityTypeConfiguration<Court>
{
    public void Configure(EntityTypeBuilder<Court> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.PricePerSlot)
            .HasColumnType("numeric(18,2)")
            .IsRequired();

        builder.Property(c => c.Status)
            .IsRequired();

        builder.HasMany(c => c.SlotConfigurations)
            .WithOne(s => s.Court)
            .HasForeignKey(s => s.CourtId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(c => c.Bookings)
            .WithOne(b => b.Court)
            .HasForeignKey(b => b.CourtId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
