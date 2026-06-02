namespace kvk.BuildingBlocks.PaymentGateway;

public sealed class PaymentGatewayChargeRequest
{
    public string OrderId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "LKR";
    public string Description { get; set; } = string.Empty;
    public PaymentGatewayCustomer Customer { get; set; } = new();
    public string? ReturnUrl { get; set; }
    public string? CancelUrl { get; set; }
    public string? NotifyUrl { get; set; }
    public Dictionary<string, string>? AdditionalFields { get; set; }
}

public sealed class PaymentGatewayCustomer
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
}

public sealed class PaymentGatewayChargeResult
{
    public bool Succeeded { get; set; }
    public string? Message { get; set; }
    public string? GatewayReference { get; set; }
    public int StatusCode { get; set; }
    public string? RawResponse { get; set; }
}

