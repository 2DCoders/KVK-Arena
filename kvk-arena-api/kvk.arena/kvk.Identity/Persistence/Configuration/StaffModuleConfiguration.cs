using kvk.Identity.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kvk.Identity.Persistence.Configuration;

public class StaffModuleConfiguration : IEntityTypeConfiguration<StaffModule>
{
    public void Configure(EntityTypeBuilder<StaffModule> builder)
    {
        builder.ToTable("StaffModules");

        builder.Property(x => x.ModuleName).HasMaxLength(100).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => new { x.StaffId, x.ModuleName }).IsUnique();

        builder.HasOne(x => x.Staff)
            .WithMany(nameof(Staff.StaffModules))
            .HasForeignKey(x => x.StaffId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}


