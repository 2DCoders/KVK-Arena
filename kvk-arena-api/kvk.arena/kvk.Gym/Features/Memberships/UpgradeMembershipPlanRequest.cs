using kvk.BuildingBlocks.Enums;

namespace kvk.Gym.Features.Memberships;

public class UpgradeMembershipPlanRequest
{
    public decimal? TrainerDiscount { get; set; }
    public byte[]? Receipt { get; set; }
	public Guid MembershipPlanId { get; set; }
	// optional: payment type for the upgrade (defaults to Cash)
	public PaymentType PaymentType { get; set; } = PaymentType.Cash;
}


