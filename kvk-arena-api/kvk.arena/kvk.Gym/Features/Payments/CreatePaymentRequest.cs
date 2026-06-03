using kvk.Gym.Enums;

namespace kvk.Gym.Features.Payments;

public class CreatePaymentRequest
{
    public decimal Amount { get; set; }
    public PaymentType PaymentType { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Paid;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? TransactionReference { get; set; }
}

