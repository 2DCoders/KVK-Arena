namespace kvk.Gym.Features.Memberships;

public class ChangeGymPasswordRequest
{

    public string NewPassword { get; set; } = string.Empty;

    public string OldPassword { get; set; } = string.Empty;
}