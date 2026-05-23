using System.Collections.Generic;

namespace kvk.BuildingBlocks.Auth;

/// <summary>
/// Minimal JWT token generation service used by Identity for issuing tokens.
/// This is intentionally small for Phase 1 and uses a development symmetric key.
/// For production, replace with configuration-driven, secure key management.
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generate a signed JWT for the given user and permissions.
    /// </summary>
    string GenerateToken(Guid userId, IEnumerable<string> permissions);
}

