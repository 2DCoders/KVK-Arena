using System.Text.Json;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace kvk.Gaming.Persistence.DesignTime;

public class GamingDesignTimeDbContextFactory : IDesignTimeDbContextFactory<GamingDbContext>
{
    public GamingDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<GamingDbContext>();

        // Try to load connection string from kvk.Host/appsettings.json by searching upward from the current directory.
        string? connectionString = null;
        var current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current != null)
        {
            var candidate = Path.Combine(current.FullName, "kvk.Host", "appsettings.json");
            if (File.Exists(candidate))
            {
                // Read JSON and extract ConnectionStrings.GymConnection or ConnectionStrings.DefaultConnection
                try
                {
                    var json = File.ReadAllText(candidate);
                    using var doc = JsonDocument.Parse(json);
                    if (doc.RootElement.TryGetProperty("ConnectionStrings", out var cs))
                    {
                        if (cs.TryGetProperty("GymConnection", out var gymEl) &&
                            gymEl.ValueKind == JsonValueKind.String)
                            connectionString = gymEl.GetString();
                        else if (cs.TryGetProperty("DefaultConnection", out var defEl) &&
                                 defEl.ValueKind == JsonValueKind.String)
                            connectionString = defEl.GetString();
                    }
                }
                catch
                {
                    // ignore parse failures and continue to other fallbacks
                }

                break;
            }

            current = current.Parent;
        }

        // Fall back to environment variables if not found in appsettings
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            connectionString = Environment.GetEnvironmentVariable("KVK_GYM_CONNECTION")
                               ?? Environment.GetEnvironmentVariable("DefaultConnection");
        }

        optionsBuilder.UseNpgsql(connectionString, b => b.MigrationsAssembly("kvk.Gym"));

        // Provide minimal services required by GamingDbContext constructor at design-time.
        var tenantService = new DesignTimeTenantService();
        var logger = Microsoft.Extensions.Logging.Abstractions
            .NullLogger<kvk.BuildingBlocks.Persistence.AppDbContextBase>.Instance;

        return new GamingDbContext(optionsBuilder.Options, tenantService, logger, null);
    }
    
    internal class DesignTimeTenantService : ITenantService
    {
        private Guid _tenant = Guid.Parse("00000000-0000-0000-0000-000000000001");
        public Guid GetCurrentTenantId() => _tenant;
        public void SetCurrentTenant(Guid tenantId) => _tenant = tenantId;
        public void ClearCurrentTenant() => _tenant = Guid.Empty;
    }
}