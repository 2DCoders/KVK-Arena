namespace kvk.Identity.Features.Auth;

public class ChangePasswordRequest
{
    /// <summary>
    /// Either the user id or username should be provided. UserId takes precedence when set.
    /// </summary>
    public Guid UserId { get; set; }

    public string UserName { get; set; } = string.Empty;

    public required string CurrentPassword { get; set; } = string.Empty;

    public required string NewPassword { get; set; } = string.Empty;
}

