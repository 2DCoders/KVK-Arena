namespace kvk.Financial.Features.GymAnalytics;

public class GymAnalyticsResponse
{
    // For range responses include the requested range
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int TotalTransactions { get; set; }
    public int SuccessfulTransactions { get; set; }
    public int PendingTransactions { get; set; }
    public int OverdueTransactions { get; set; }
    public int CancelledTransactions { get; set; }

    public decimal TotalRevenue { get; set; }
    public decimal PendingRevenue { get; set; }
    public decimal OverdueRevenue { get; set; }
    public decimal CancelledRevenue { get; set; }

    public decimal CashRevenue { get; set; }
    public decimal CreditCardRevenue { get; set; }
    public decimal PayPalRevenue { get; set; }

    public int NewMemberships { get; set; }
    public int RenewedMemberships { get; set; }
    public int ExpiredMemberships { get; set; }

    public DateTime LastRefreshAt { get; set; }
}

