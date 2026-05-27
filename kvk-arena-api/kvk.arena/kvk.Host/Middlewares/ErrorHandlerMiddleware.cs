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

    public ErrorHandlerMiddleware(RequestDelegate next, ILogger<ErrorHandlerMiddleware> logger)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
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
            await context.Response.WriteAsJsonAsync(new
            {
                error = "Internal Server Error",
                message = "An unexpected error occurred",
                timestamp = DateTime.UtcNow
            });
        }
    }
}