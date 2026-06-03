# PayHere Sandbox Charge (KVK Arena)

This integration adds a DI-friendly PayHere sandbox charge service in `kvk.BuildingBlocks`. It posts a form-encoded payload to the configured sandbox charge URL and returns a normalized response.

## Configuration

Update `kvk.Host/appsettings.json`:

```
"PayHere": {
  "ApiKey": "<sandbox_api_key_or_merchant_id>",
  "ApiSecret": "<sandbox_api_secret_or_merchant_secret>",
  "ChargeUrl": "https://sandbox.payhere.lk/merchant/v1/charge",
  "ApiKeyFieldName": "api_key",
  "ApiSecretFieldName": "api_secret",
  "TimeoutSeconds": 30
}
```

If PayHere expects different credential field names (for example, `merchant_id` and `merchant_secret`), change `ApiKeyFieldName` and `ApiSecretFieldName` accordingly. If the sandbox charge endpoint differs, update `ChargeUrl`.

## DI Registration

`IPaymentGatewayService` is registered in `kvk.Host/Program.cs`:

```
builder.Services.Configure<PayHereOptions>(builder.Configuration.GetSection(PayHereOptions.SectionName));
builder.Services.AddHttpClient<IPaymentGatewayService, PaymentGatewayService>();
```

## Usage Example

```
public class SomeService
{
    private readonly IPaymentGatewayService _gateway;

    public SomeService(IPaymentGatewayService gateway)
    {
        _gateway = gateway;
    }

    public async Task<PaymentGatewayChargeResult> ChargeAsync()
    {
        var request = new PaymentGatewayChargeRequest
        {
            OrderId = "ORDER-1001",
            Amount = 2500.00m,
            Currency = "LKR",
            Description = "Membership payment",
            Customer = new PaymentGatewayCustomer
            {
                FirstName = "Ash",
                LastName = "Perera",
                Email = "ash@example.com",
                Phone = "0771234567",
                Address = "12 Main St",
                City = "Colombo",
                Country = "Sri Lanka"
            },
            ReturnUrl = "https://example.com/return",
            CancelUrl = "https://example.com/cancel",
            NotifyUrl = "https://example.com/notify",
            AdditionalFields = new Dictionary<string, string>
            {
                ["custom_1"] = "membership",
                ["custom_2"] = "gym"
            }
        };

        return await _gateway.CreateChargeAsync(request);
    }
}
```

## Notes

- This is a sandbox-only implementation. Switch URLs and credentials for production later.
- If PayHere requires a hash/signature, add it to `AdditionalFields` and adjust the payload format in `PaymentGatewayService`.

