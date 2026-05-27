using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Identity.Domain;

namespace kvk.Identity.Persistence.Configuration;

public class StaffRoleConfiguration : IEntityTypeConfiguration<StaffRole>
{
    public void Configure(EntityTypeBuilder<StaffRole> builder)
    {
        builder.ToTable("StaffRoles");

        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => new { x.StaffId, x.RoleId }).IsUnique();

        builder.HasOne(x => x.Staff)
            .WithMany(x => x.StaffRoles)
            .HasForeignKey(x => x.StaffId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Role)
            .WithMany(x => x.StaffRoles)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

