using kvk.Gym.Enums;

namespace kvk.Gym.Features.PaymentGateway;

public class PaymentGatewayStatusResponse
{
    public required string OrderId { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
