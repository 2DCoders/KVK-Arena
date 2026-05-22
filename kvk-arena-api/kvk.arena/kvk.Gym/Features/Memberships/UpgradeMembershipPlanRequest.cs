namespace kvk.Gym.Features.Memberships;

public class UpgradeMembershipPlanRequest
{
	public Guid MembershipPlanId { get; set; }
	// optional: payment type for the upgrade (defaults to Cash)
	public kvk.Gym.Enums.PaymentType PaymentType { get; set; } = kvk.Gym.Enums.PaymentType.Cash;
}


