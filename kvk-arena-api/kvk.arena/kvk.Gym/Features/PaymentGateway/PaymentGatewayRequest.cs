namespace kvk.Gym.Features.PaymentGateway;

public class PaymentGatewayRequest
{
    public decimal Amount { get; set; }
    
    public Guid MemberId { get; set; }
    
    public Guid MembershipPlanId { get; set; }
}