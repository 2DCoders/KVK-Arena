using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Reflection;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using kvk.BuildingBlocks.Auth;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using kvk.Host.Middlewares;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

// Exercise real authorization metadata and JWT middleware without running database-backed actions.
var publicRoutes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "POST api/identity-m/auth/staff/login",
    "GET api/identity/holidays/next-working-days",
    "POST api/identity/customer-feedback",
    "POST api/identity/members/register",
    "POST api/gym/members", "POST api/gym/members/login", "GET api/gym/members/trainers",
    "GET api/gym/membership-plans",
    "POST api/payments/create", "POST api/payments/reverse", "POST api/payments/notify",
    "GET api/badminton/courts",
    "GET api/badminton/court-slot-configurations/availability-by-court",
    "POST api/badminton/bookings/multi-hold", "POST api/badminton/bookings/confirm-multi",
    "POST api/badminton/bookings/create-multi", "POST api/badminton/bookings/notify",
    "GET api/cafe/menu/category/{category}", "POST api/payments/cafe/notify",
    "GET api/car-service/wash-service", "GET api/car-service/package",
    "GET api/gaming-m/additional-purchases/by-category/{categoryId:guid}",
    "GET api/gaming-m/games", "GET api/gaming-m/gaming-categories",
    "GET api/gaming-m/gaming-categories/{id:guid}",
    "GET api/gaming-m/gaming-stations/by-category/{categoryId:guid}",
    "GET api/gaming-m/gaming-slot-generation/availability-by-station-category",
    "GET api/gaming-m/gaming-slot-generation/configuration-by-category",
    "POST api/gaming-m/gaming-bookings/multi-hold", "POST api/gaming-m/gaming-bookings/confirm-multi",
    "POST api/gaming-m/gaming-bookings/create-multi-payment", "POST api/gaming-m/gaming-bookings/notify",
    "GET api/saloon/service-items", "POST api/saloon/bookings",
    "POST api/saloon/bookings/create-with-payment", "POST api/saloon/bookings/notify",
    "POST api/saloon/bookings/reverse", "GET api/saloon/bookings/availability",
    "GET api/saloon/bookings/day-availability"
};

var builder = WebApplication.CreateBuilder();
builder.Logging.ClearProviders();
builder.WebHost.UseUrls("http://127.0.0.1:0");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => options.TokenValidationParameters = JwtService.CreateTokenValidationParameters());
builder.Services.AddAuthorization();
builder.Services.AddScoped<ITenantService, TenantService>();
var mvc = builder.Services.AddControllers();
foreach (var assembly in new[]
{
    typeof(kvk.Identity.IdentityModuleInitializer).Assembly,
    typeof(kvk.Gym.GymModuleInitializer).Assembly,
    typeof(kvk.Badminton.BadmintonModuleInitializer).Assembly,
    typeof(kvk.Gaming.GamingModuleInitializer).Assembly,
    typeof(kvk.CarService.CarServiceModuleInitializer).Assembly,
    typeof(Kvk.Cafe.CafeModuleInitializer).Assembly,
    typeof(kvk.Saloon.SaloonModuleInitializer).Assembly,
    typeof(kvk.Financial.FinancialModuleInitializer).Assembly
})
    mvc.AddApplicationPart(assembly);

await using var app = builder.Build();
app.UseRouting();
app.UseMiddleware<TenantPermissionMiddleware>();
app.UseMiddleware<ErrorHandlerMiddleware>();
app.UseAuthentication();
app.UseAuthorization();

var cases = new List<(string Method, string Route, bool Public)>();
var seenPublic = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
var descriptors = app.Services.GetRequiredService<IActionDescriptorCollectionProvider>()
    .ActionDescriptors.Items.OfType<ControllerActionDescriptor>();
foreach (var action in descriptors)
{
    if (action.ControllerTypeInfo.Name is "RoleController" or "SampleFeatureController") continue;
    var route = action.AttributeRouteInfo?.Template?.TrimStart('~', '/');
    if (route == null) continue;
    var metadata = action.ControllerTypeInfo.GetCustomAttributes(true)
        .Concat(action.MethodInfo.GetCustomAttributes(true)).ToArray();
    var anonymous = metadata.OfType<IAllowAnonymous>().Any();
    var authorized = metadata.OfType<IAuthorizeData>().Any();
    foreach (var method in action.MethodInfo.GetCustomAttributes<HttpMethodAttribute>().SelectMany(a => a.HttpMethods))
    {
        var key = $"{method} {route}";
        var isPublic = publicRoutes.Contains(key);
        if (isPublic) seenPublic.Add(key);
        if (isPublic != anonymous || (!isPublic && !authorized))
            throw new Exception($"Incorrect authorization metadata: {key}");
        app.MapMethods(route, new[] { method }, () => "action reached").WithMetadata(metadata);
        var url = Regex.Replace(route, @"\{[^}]+\}", "11111111-1111-1111-1111-111111111111");
        cases.Add((method, url, isPublic));
    }
}
if (!publicRoutes.SetEquals(seenPublic))
    throw new Exception("Public route missing from discovered actions: " + string.Join(", ", publicRoutes.Except(seenPublic)));

await app.StartAsync();
using var client = new HttpClient { BaseAddress = new Uri(app.Urls.Single()) };
var validToken = new JwtService().GenerateToken(Guid.NewGuid(), Array.Empty<string>());
var parameters = JwtService.CreateTokenValidationParameters();
string MakeToken(DateTime expires, string issuer = "kvk", string audience = "kvk", bool wrongKey = false)
{
    var key = wrongKey ? new SymmetricSecurityKey(Encoding.UTF8.GetBytes("wrong-signing-key-that-is-at-least-thirty-two-bytes")) : parameters.IssuerSigningKey;
    return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
        issuer, audience, new[] { new Claim("TenantId", "00000000-0000-0000-0000-000000000001") },
        DateTime.UtcNow.AddHours(-2), expires, new SigningCredentials(key, SecurityAlgorithms.HmacSha256)));
}
var invalidTokens = new[]
{
    "not-a-jwt", MakeToken(DateTime.UtcNow.AddMinutes(-10)),
    MakeToken(DateTime.UtcNow.AddHours(1), wrongKey: true),
    MakeToken(DateTime.UtcNow.AddHours(1), issuer: "wrong"),
    MakeToken(DateTime.UtcNow.AddHours(1), audience: "wrong")
};
var checks = 0;
async Task Check(string method, string route, string? token, HttpStatusCode expected)
{
    using var request = new HttpRequestMessage(new HttpMethod(method), route);
    if (token != null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    using var response = await client.SendAsync(request);
    if (response.StatusCode != expected)
        throw new Exception($"{method} {route}: expected {(int)expected}, got {(int)response.StatusCode}");
    checks++;
}
foreach (var test in cases)
{
    await Check(test.Method, test.Route, null, test.Public ? HttpStatusCode.OK : HttpStatusCode.Unauthorized);
    await Check(test.Method, test.Route, validToken, HttpStatusCode.OK);
    if (!test.Public)
        foreach (var token in invalidTokens)
            await Check(test.Method, test.Route, token, HttpStatusCode.Unauthorized);
}
await app.StopAsync();
Console.WriteLine($"Passed {checks} HTTP authorization checks across {cases.Count} actions ({cases.Count(c => c.Public)} public). Valid JWTs with no permissions are accepted; missing, malformed, expired, wrong-signature, wrong-issuer, and wrong-audience JWTs are rejected on protected routes.");