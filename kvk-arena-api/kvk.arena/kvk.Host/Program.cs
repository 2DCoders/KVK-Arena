using System.Diagnostics;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using kvk.Host.Middlewares;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// Services Registration
// ============================================================

// Add OpenAPI/Swagger documentation
builder.Services.AddOpenApi();
builder.Services.AddControllers();


// Add core infrastructure services
builder.Services.AddScoped<ITenantService, TenantService>();
builder.Services.AddHttpContextAccessor();

// Add logging
builder.Services.AddLogging(config =>
{
    config.AddConsole();
    if (builder.Environment.IsDevelopment())
        config.SetMinimumLevel(LogLevel.Debug);
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// Add controllers
builder.Services.AddControllers();

// Note: Module-specific DbContexts and services will be registered by module initializers (Phase 2)
// Example:
// var identityInitializer = new IdentityModuleInitializer();
// identityInitializer.RegisterModule(builder.Services, builder.Configuration);

var app = builder.Build();

// ============================================================
// Middleware Pipeline
// ============================================================

// Error handling middleware (should be first to catch all errors)
app.UseMiddleware<ErrorHandlerMiddleware>();

// Tenant permission middleware (extracts TenantId from JWT)
app.UseMiddleware<TenantPermissionMiddleware>();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
    // Scalar - Modern API documentation (default at /scalar/v1)
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("KVK Arena API")
            .WithTheme(ScalarTheme.DeepSpace)
            .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.Axios);
    });
}

app.UseHttpsRedirection();
app.UseCors();
app.MapControllers();

// Log startup information
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("KVK Arena API starting up...");
logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);

if (app.Environment.IsDevelopment())
{
    // Start the app asynchronously to open browser
    await app.StartAsync();
    
    // Open Scalar documentation in browser
    var url = app.Urls.FirstOrDefault(u => u.StartsWith("https://"));
    if (url != null)
    {
        Process.Start(new ProcessStartInfo(url + "/scalar/v1") { UseShellExecute = true });
    }
    
    await app.WaitForShutdownAsync();
}
else
{
    app.Run();
}

