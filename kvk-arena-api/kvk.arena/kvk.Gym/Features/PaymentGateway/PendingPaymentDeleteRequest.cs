namespace kvk.Gym.Features.PaymentGateway;

public class PendingPaymentDeleteRequest
{
    
    public Guid MemberId { get; set; }
    
    public required string OrderId { get; set; } 
    
    public required Guid MembershipPlanId { get; set; }

}