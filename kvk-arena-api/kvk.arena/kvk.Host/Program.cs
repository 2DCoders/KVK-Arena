using System.Diagnostics;
using Hangfire;
using Hangfire.PostgreSql;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using kvk.Host.Middlewares;
using kvk.Identity;
using kvk.Gym;
using kvk.Financial;
using kvk.Badminton;
using kvk.Gaming;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Microsoft.Extensions.Options;
using Serilog;
using System.Text.Json.Serialization;
using Newtonsoft.Json.Serialization;
using kvk.BuildingBlocks.Common;


var builder = WebApplication.CreateBuilder(args);

// ============================================================
// Serilog Configuration
// ============================================================
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();


// ============================================================
// Services Registration
// ============================================================

// Add OpenAPI/Swagger documentation
builder.Services.AddOpenApi();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.WriteIndented = true;
});


// Add core infrastructure services
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddHttpContextAccessor();
// Register IHttpClientFactory for remote ICS imports
builder.Services.AddHttpClient();

builder.Services.Configure<PayHereOptions>(builder.Configuration.GetSection(PayHereOptions.SectionName));
// builder.Services.AddHttpClient<IPaymentGatewayService, PaymentGatewayService>();

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "KVK Arena API", 
        Version = "v1",
        Description = "A multi-tenant Hotel ERD API built with .NET 10 and PostgreSQL"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    // c.AddSecurityRequirement(new OpenApiSecurityRequirement
    // {
    //     {
    //         new OpenApiSecurityScheme
    //         {
    //             Reference = new OpenApiReference
    //             {
    //                 Type = ReferenceType.SecurityScheme,
    //                 Id = "Bearer"
    //             }
    //         },
    //         Array.Empty<string>()
    //     }
    // });
});


builder.Services.AddAuthorization();
// Add logging
// builder.Services.AddLogging(config =>
// {
//     config.AddConsole();
//     if (builder.Environment.IsDevelopment())
//         config.SetMinimumLevel(LogLevel.Debug);
// });

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var hangfireConnection = builder.Configuration.GetConnectionString("HangfireConnection");

if (string.IsNullOrWhiteSpace(hangfireConnection))
    hangfireConnection = builder.Configuration.GetConnectionString("DefaultConnection");

if (string.IsNullOrWhiteSpace(hangfireConnection))
    throw new InvalidOperationException("A connection string named 'HangfireConnection' or 'DefaultConnection' is required for Hangfire.");

builder.Services.AddHangfire(config =>
{
    config.UseSimpleAssemblyNameTypeSerializer()
        .UseRecommendedSerializerSettings()
        .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(hangfireConnection));
});

builder.Services.AddHangfireServer();

// Register module services
var identityInitializer = new IdentityModuleInitializer();
identityInitializer.RegisterModule(builder.Services, builder.Configuration);

var gymInitializer = new GymModuleInitializer();
gymInitializer.RegisterModule(builder.Services, builder.Configuration);

var financialInitializer = new FinancialModuleInitializer();
financialInitializer.RegisterModule(builder.Services, builder.Configuration);

var badmintonInitializer = new BadmintonModuleInitializer();
badmintonInitializer.RegisterModule(builder.Services, builder.Configuration);

var gamingInitializer  = new GamingModuleInitializer();
gamingInitializer.RegisterModule(builder.Services, builder.Configuration);

var carServiceInitializer  = new CarServiceModuleInitializer();
carServiceInitializer.RegisterModule(builder.Services, builder.Configuration);




var app = builder.Build();


// Apply EF Core migrations at startup
// using (var scope = app.Services.CreateScope())
// {
//     var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContextBase>();
//     dbContext.Database.Migrate();
// }


// Error handling middleware (should be first to catch all errors)


// Tenant permission middleware (extracts TenantId from JWT)
app.UseMiddleware<TenantPermissionMiddleware>();
app.UseMiddleware<ErrorHandlerMiddleware>();

// if (app.Environment.IsDevelopment())
// {
//     app.Map("/logger", loggerApp =>
//     {
//         loggerApp.UseLoggerViewer();
//     });
// }


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "KVK Arena API v1");
        c.RoutePrefix = "swagger";
    });
}


app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard("/hangfire");

app.UseCors();
app.MapControllers();

// Log startup information
var logger = app.Services.GetRequiredService<Microsoft.Extensions.Logging.ILogger<Program>>();

// Initialize background processors from modules
using (var scope = app.Services.CreateScope())
{
    var scopedServices = scope.ServiceProvider;
    var backgroundProcessorInitializers = scopedServices.GetServices<IBackgroundProcessorInitializer>();
    foreach (var initializer in backgroundProcessorInitializers)
    {
        await initializer.InitializeAsync(scopedServices, logger);
    }
}

logger.LogInformation("KVK Arena API starting up...");
logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);


if (app.Environment.IsDevelopment())
{
    // Try to resolve configured application URL(s). Fall back to the default HTTPS URL used by templates.
    var urlsConfig = builder.Configuration["ASPNETCORE_URLS"] ?? builder.Configuration["urls"];
    var baseUrl = string.IsNullOrEmpty(urlsConfig) ? "https://localhost:5001" : urlsConfig.Split(';')[0];
    var swaggerUrl = baseUrl.TrimEnd('/') + "/swagger";

    var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
    lifetime.ApplicationStarted.Register(() =>
    {
        try
        {
            Process.Start(new ProcessStartInfo { FileName = swaggerUrl, UseShellExecute = true });
        }
        catch (Exception ex)
        {
            var loggerLocal = app.Services.GetRequiredService<Microsoft.Extensions.Logging.ILogger<Program>>();
            loggerLocal.LogWarning(ex, "Failed to launch browser for Swagger UI.");
        }
    });
}

app.Run();