using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Identity.Domain;

namespace kvk.Identity.Persistence.Configuration;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("RolePermissions");

        builder.Property(x => x.Code).HasMaxLength(150).IsRequired();
        builder.Property(x => x.IsActive).IsRequired();

        builder.HasIndex(x => new { x.RoleId, x.Code }).IsUnique();

        builder.HasOne(x => x.Role)
            .WithMany(x => x.RolePermissions)
            .HasForeignKey(x => x.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.ApplicationPermission)
            .WithMany()
            .HasPrincipalKey(x => x.Code)
            .HasForeignKey(x => x.Code)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

