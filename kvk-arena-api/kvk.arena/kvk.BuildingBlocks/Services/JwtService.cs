using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace kvk.BuildingBlocks.Auth;

/// <summary>
/// Simple JWT service for development and local testing.
/// - Uses a fixed symmetric key and a hardcoded tenant id (Phase 1 requirement).
/// - Emits multiple "permission" claims for available permissions.
/// Replace with a proper config-driven implementation for production.
/// </summary>
public class JwtService : IJwtService
{
    // NOTE: development-only secret. Replace in production via configuration/Key Vault.
    private const string DevSecret = "kvk-dev-secret-key-change-this-to-secure-long-value";
    private static readonly byte[] SigningKey = Encoding.UTF8.GetBytes(DevSecret);

    // Hardcoded tenant id for this KV K instance (Phase 1 temporary requirement)
    private static readonly Guid HardcodedTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public string GenerateToken(Guid userId, IEnumerable<string> permissions)
    {
        var claims = new List<Claim>
        {
            new Claim("UserId", userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim("TenantId", HardcodedTenantId.ToString())
        };

        if (permissions != null)
        {
            foreach (var p in permissions)
            {
                if (!string.IsNullOrWhiteSpace(p))
                    claims.Add(new Claim("permission", p));
            }
        }

        var key = new SymmetricSecurityKey(SigningKey);
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: "kvk",
            audience: "kvk",
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

