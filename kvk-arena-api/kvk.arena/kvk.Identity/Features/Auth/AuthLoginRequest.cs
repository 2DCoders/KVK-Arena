namespace kvk.Identity.Features.Auth;

public class AuthLoginRequest
{
    public required string Username { get; set; } = string.Empty;
    public required string Password { get; set; } = string.Empty;
}

