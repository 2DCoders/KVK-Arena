using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using kvk.Identity.Domain;

namespace kvk.Identity.Persistence.Configuration;

public class StaffConfiguration : IEntityTypeConfiguration<Staff>
{
    public void Configure(EntityTypeBuilder<Staff> builder)
    {
        builder.ToTable("Staff");

        // Map inherited properties by name
        builder.Property<string>("FirstName").HasMaxLength(50).IsRequired();
        builder.Property<string>("LastName").HasMaxLength(50).IsRequired();
        builder.Property<string>("UserName").HasMaxLength(50).IsRequired();
        builder.Property<string>("Email").HasMaxLength(100).IsRequired();
        builder.Property<string?>("Phone").HasMaxLength(25);
        builder.Property<string>("PasswordHash").HasMaxLength(256).IsRequired();
        builder.Property<string>("Status").HasMaxLength(25).IsRequired();

        builder.HasIndex("Email").IsUnique();
        builder.HasIndex("UserName").IsUnique();
    }
}

