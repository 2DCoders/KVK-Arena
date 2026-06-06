namespace kvk.Gym.Features.Memberships;

public class ChangePasswordRequest
{
    public required Guid MemberId { get; set; }

    public string NewPassword { get; set; } = null!;

    public string OldPassword { get; set; } = null!;
}