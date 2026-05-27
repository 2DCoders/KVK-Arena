using kvk.Gym.Enums;

namespace kvk.Gym.Features.DayPassMembers;

public class DayPassMemberCreateRequest
{
	public string Name { get; set; } = string.Empty;
	public string MobileNumber { get; set; } = string.Empty;
	public DateTime Date { get; set; }
	public decimal Amount { get; set; }
	public Guid MembershipPlanId { get; set; }
	public PaymentType PaymentType { get; set; }
	public PaymentStatus PaymentStatus { get; set; }
}


