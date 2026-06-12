using kvk.Gym.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kvk.Gym.Persistence.Configuration;

public class TrainerConfiguration : IEntityTypeConfiguration<Trainer>
{
    public void Configure(EntityTypeBuilder<Trainer> builder)
    {
        builder.Property(t => t.Specialization).HasMaxLength(500);
        builder.Property(t => t.Rating).HasDefaultValue(0);
        builder.Property(t => t.YearsOfExperience).HasDefaultValue(0);
        
        builder.HasIndex(t => t.Email).IsUnique();
        
        builder.HasMany(x => x.ApprovalRequests)
            .WithOne(x => x.Trainer)
            .HasForeignKey(x => x.TrainerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}