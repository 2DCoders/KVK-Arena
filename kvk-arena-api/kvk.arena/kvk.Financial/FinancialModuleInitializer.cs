using kvk.BuildingBlocks.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace kvk.Financial;

public class FinancialModuleInitializer : IModuleInitializer
{
    public void RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        // Register financial services
        services.AddScoped<Features.GymAnalytics.GymAnalyticsService>();
    }
}

