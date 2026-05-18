using System;
using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using kvk.BuildingBlocks.Services;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.Identity.Persistence.DesignTime;

/// <summary>
/// Design-time factory for IdentityApplicationDbContext so EF tools can create the context to scaffold migrations.
/// Uses a local PostgreSQL connection string suitable for development.
/// </summary>
public class IdentityDesignTimeDbContextFactory : IDesignTimeDbContextFactory<IdentityApplicationDbContext>
{
        public IdentityApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<IdentityApplicationDbContext>();

            // Try to load connection string from kvk.Host/appsettings.json by searching upward from the current directory.
            string? connectionString = null;
            var current = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (current != null)
            {
                var candidate = Path.Combine(current.FullName, "kvk.Host", "appsettings.json");
                if (File.Exists(candidate))
                {
                    // Read JSON and extract ConnectionStrings.IdentityConnection or ConnectionStrings.DefaultConnection
                    try
                    {
                        var json = File.ReadAllText(candidate);
                        using var doc = JsonDocument.Parse(json);
                        if (doc.RootElement.TryGetProperty("ConnectionStrings", out var cs))
                        {
                            if (cs.TryGetProperty("IdentityConnection", out var idEl) && idEl.ValueKind == JsonValueKind.String)
                                connectionString = idEl.GetString();
                            else if (cs.TryGetProperty("DefaultConnection", out var defEl) && defEl.ValueKind == JsonValueKind.String)
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
                connectionString = Environment.GetEnvironmentVariable("KVK_IDENTITY_CONNECTION")
                                   ?? Environment.GetEnvironmentVariable("DefaultConnection");
            }

            optionsBuilder.UseNpgsql(connectionString, b => b.MigrationsAssembly("kvk.Identity"));

            // Simple tenant service and logger for design-time context creation
            ITenantService tenantService = new TenantService();
            var loggerFactory = LoggerFactory.Create(builder => { });
            var logger = loggerFactory.CreateLogger<kvk.BuildingBlocks.Persistence.AppDbContextBase>();

            return new IdentityApplicationDbContext(optionsBuilder.Options, tenantService, logger, null);
        }
}


