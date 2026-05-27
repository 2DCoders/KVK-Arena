using System.IdentityModel.Tokens.Jwt;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.Host.Middlewares;

/// <summary>
/// Middleware responsible for extracting tenant ID from JWT claims
/// and setting the request context before any business logic executes.
/// 
/// Phase 1: For development, tenant is hardcoded to 00000000-0000-0000-0000-000000000000.
/// This middleware validates the token format but doesn't enforce tenant-specific checks.
/// 
/// Execution order: Should run EARLY in the middleware pipeline (before routing/authorization).
/// </summary>
public class TenantPermissionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantPermissionMiddleware> _logger;

    public TenantPermissionMiddleware(RequestDelegate next, ILogger<TenantPermissionMiddleware> logger)
    {
        _next = next ?? throw new ArgumentNullException(nameof(next));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        try
        {
            var authorization = context.Request.Headers["Authorization"].ToString();

            // If no Authorization header, pass through (some endpoints may be public)
            if (string.IsNullOrWhiteSpace(authorization))
            {
                _logger.LogDebug("Request has no Authorization header");
                await _next(context);
                return;
            }

            // Extract token from "Bearer {token}"
            var token = authorization
                .Replace("Bearer ", string.Empty, StringComparison.OrdinalIgnoreCase)
                .Trim();

            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Authorization header present but token is empty");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Invalid token format" });
                return;
            }

            // Parse JWT (without validation - validation happens in Authorization middleware)
            var handler = new JwtSecurityTokenHandler();
            JwtSecurityToken jwtToken;

            try
            {
                jwtToken = handler.ReadJwtToken(token);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning("Failed to parse JWT token: {Message}", ex.Message);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Invalid token format" });
                return;
            }

            // Extract TenantId from claims (Phase 1: informational only, tenant is hardcoded)
            var tenantIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "TenantId")?.Value;

            if (string.IsNullOrWhiteSpace(tenantIdClaim))
            {
                _logger.LogWarning("JWT token missing TenantId claim");
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Token missing TenantId claim" });
                return;
            }

            // Validate TenantId is a valid GUID
            if (!Guid.TryParse(tenantIdClaim, out var tenantId))
            {
                _logger.LogWarning("JWT TenantId claim is not a valid GUID: {TenantId}", tenantIdClaim);
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new { error = "Invalid TenantId format" });
                return;
            }

            // Phase 1: Allow hardcoded empty GUID (00000000-0000-0000-0000-000000000000)
            // In Phase 2, this will be replaced with proper tenant validation
            
            // Call SetCurrentTenant - TenantService will ignore and return hardcoded value
            tenantService.SetCurrentTenant(tenantId);
            _logger.LogInformation("Token contains TenantId: {TenantId} for request {RequestPath}", tenantId, context.Request.Path);

            // Add tenant info to HttpContext items for logging/debugging
            context.Items["TenantId"] = tenantId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error in TenantPermissionMiddleware");
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { error = "Internal server error" });
            return;
        }

        await _next(context);
    }
}