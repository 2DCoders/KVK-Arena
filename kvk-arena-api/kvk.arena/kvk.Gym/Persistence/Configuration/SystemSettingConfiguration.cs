using kvk.Gym.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace kvk.Gym.Persistence.Configuration;

public class SystemSettingConfiguration : IEntityTypeConfiguration<SystemSetting>
{
    public void Configure(EntityTypeBuilder<SystemSetting> builder)
    {
        builder.Property(s => s.Id)
            .ValueGeneratedNever()
            .HasDefaultValue(SystemSetting.SingletonId);

        builder.ToTable(tableBuilder =>
        {
            tableBuilder.HasCheckConstraint(
                "CK_SystemSetting_Singleton",
                $"\"Id\" = '{SystemSetting.SingletonId}'");
        });
    }
}
