using System.Diagnostics;
using Microsoft.Extensions.Hosting;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Persistence;
using kvk.BuildingBlocks.Services;
using kvk.Host.Middlewares;
using kvk.Identity;
using kvk.Gym;
using kvk.Financial;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
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
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddHttpContextAccessor();


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




// Register Identity module (DbContext + services). This enables identity endpoints and JWT support.
var identityInitializer = new IdentityModuleInitializer();
identityInitializer.RegisterModule(builder.Services, builder.Configuration);

// Register Gym module so its integrator event handlers are available in DI.
var gymInitializer = new GymModuleInitializer();
gymInitializer.RegisterModule(builder.Services, builder.Configuration);

// Register Financial module (analytics/services)
var financialInitializer = new FinancialModuleInitializer();
financialInitializer.RegisterModule(builder.Services, builder.Configuration);

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
app.UseCors();
app.MapControllers();




// Log startup information
var logger = app.Services.GetRequiredService<ILogger<Program>>();
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
            var loggerLocal = app.Services.GetRequiredService<ILogger<Program>>();
            loggerLocal.LogWarning(ex, "Failed to launch browser for Swagger UI.");
        }
    });
}

app.Run();