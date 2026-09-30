namespace kvk.Financial.Features.SaloonAnalytics;

public class SaloonAnalyticsResponse
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public int TotalTransactions { get; set; }
    public int SuccessfulTransactions { get; set; }
    public int PendingTransactions { get; set; }
    public int CancelledTransactions { get; set; }

    public decimal TotalRevenue { get; set; }
    public decimal PendingRevenue { get; set; }
    public decimal CancelledRevenue { get; set; }

    public decimal CashRevenue { get; set; }
    public decimal CreditCardRevenue { get; set; }
    public decimal DebitCardRevenue { get; set; }
    public decimal PayPalRevenue { get; set; }
    public decimal OnlinePaymentRevenue { get; set; }
}
