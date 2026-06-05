using System.Diagnostics;
using Hangfire;
using Hangfire.PostgreSql;
using kvk.BuildingBlocks;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using kvk.Host.Middlewares;
using kvk.Identity;
using kvk.Gym;
using kvk.Gym.Domain;
using kvk.Gym.Options;
using kvk.Gym.Services;
using kvk.Financial;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Microsoft.Extensions.Options;
using Serilog;
//using AG.LoggerViewer.UI;

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
builder.Services.AddControllers();

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

// Register module services]]]]]]]]]]]]]]
var identityInitializer = new IdentityModuleInitializer();
identityInitializer.RegisterModule(builder.Services, builder.Configuration);

var gymInitializer = new GymModuleInitializer();
gymInitializer.RegisterModule(builder.Services, builder.Configuration);

var financialInitializer = new FinancialModuleInitializer();
financialInitializer.RegisterModule(builder.Services, builder.Configuration);

// builder.Services.AddLoggerViewer();

var app = builder.Build();


// Apply EF Core migrations at startup
// using (var scope = app.Services.CreateScope())
// {
//     var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContextBase>();
//     dbContext.Database.Migrate();
// }


// Error handling middleware (should be first to catch all errors)
app.UseMiddleware<ErrorHandlerMiddleware>();

// Tenant permission middleware (extracts TenantId from JWT)
app.UseMiddleware<TenantPermissionMiddleware>();



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
// app.UseLoggerViewer();

// Log startup information
var logger = app.Services.GetRequiredService<Microsoft.Extensions.Logging.ILogger<Program>>();

var dayEndOptions = app.Services.GetRequiredService<IOptions<GymDayEndOptions>>().Value;
var dayEndTimeZone = ResolveTimeZone(dayEndOptions.TimeZoneId, logger);
var runAt = dayEndOptions.RunAt;
var dailyCron = Cron.Daily(runAt.Hours, runAt.Minutes);

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GymDbContext>();
    var currentSetting = db.SystemSettings
        .AsNoTracking()
        .FirstOrDefault(s => s.Id == SystemSetting.SingletonId);

    var businessDate = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, dayEndTimeZone).Date;

    if (currentSetting == null || currentSetting.CurrentDay.Date < businessDate)
    {
        BackgroundJob.Enqueue<SystemSettingRolloverService>(job => job.RunAsync());
        logger.LogInformation("System setting rollover queued for catch-up.");
    }
}

RecurringJob.AddOrUpdate<SystemSettingRolloverService>(
    "Gym.SystemSettingRollover",
    job => job.RunAsync(),
    dailyCron,
    new RecurringJobOptions { TimeZone = dayEndTimeZone });

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

static TimeZoneInfo ResolveTimeZone(string? timeZoneId, Microsoft.Extensions.Logging.ILogger logger)
{
    if (string.IsNullOrWhiteSpace(timeZoneId))
        return TimeZoneInfo.Local;

    try
    {
        return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
    }
    catch (TimeZoneNotFoundException)
    {
        logger.LogWarning("Time zone '{TimeZoneId}' not found. Falling back to local time.", timeZoneId);
        return TimeZoneInfo.Local;
    }
    catch (InvalidTimeZoneException)
    {
        logger.LogWarning("Time zone '{TimeZoneId}' invalid. Falling back to local time.", timeZoneId);
        return TimeZoneInfo.Local;
    }
}
