using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace kvk.Host.Middlewares;

/// <summary>
/// Global exception handling middleware.
/// Catches all unhandled exceptions and returns consistent error responses.
/// Logs errors with request context (TenantId, UserId, Path).
/// </summary>
public class ErrorHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlerMiddleware> _logger;
    private readonly IWebHostEnvironment _env; // Inject IWebHostEnvironment

    public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger, IWebHostEnvironment env)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _env = env ?? throw new ArgumentNullException(nameof(env)); // Initialize IWebHostEnvironment
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (InvalidOperationException ex) when (ex.Message.Contains("Tenant context"))
        {
            // Tenant context errors (not authenticated or tenant not set)
            _logger.LogWarning(ex, "Tenant context error: {Message}", ex.Message);
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Unauthorized",
                message = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
        catch (ArgumentException ex)
        {
            // Validation errors
            _logger.LogWarning(ex, "Validation error: {Message}", ex.Message);
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Bad Request",
                message = ex.Message,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            // Unexpected errors
            var tenantId = context.Items.ContainsKey("TenantId") ? context.Items["TenantId"] : "Unknown";
            var userId = context.User?.FindFirst("UserId")?.Value ?? "Unknown";
            
            _logger.LogError(ex, 
                "Unhandled exception. TenantId: {TenantId}, UserId: {UserId}, Path: {Path}, Message: {Message}",
                tenantId, userId, context.Request.Path, ex.Message);

            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var response = new 
            {
                error = "Internal Server Error",
                message = _env.IsDevelopment() ? ex.Message : "An unexpected error occurred", // Show message in dev
                stackTrace = _env.IsDevelopment() ? ex.StackTrace : null, // Show stack trace in dev
                timestamp = DateTime.UtcNow
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}