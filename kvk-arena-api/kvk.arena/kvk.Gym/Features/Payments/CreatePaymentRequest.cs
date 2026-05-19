namespace kvk.Gym.Features.Payments;

public class CreatePaymentRequest
{
    public decimal Amount { get; set; }
    public kvk.Gym.Enums.PaymentType PaymentType { get; set; }
    public kvk.Gym.Enums.PaymentStatus PaymentStatus { get; set; } = kvk.Gym.Enums.PaymentStatus.Paid;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? TransactionReference { get; set; }
}

