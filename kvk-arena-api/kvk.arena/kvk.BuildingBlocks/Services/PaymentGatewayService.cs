using System.Globalization;
using System.Text.Json;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.PaymentGateway;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace kvk.BuildingBlocks.Services;

public class PaymentGatewayService : IPaymentGatewayService
{
    private readonly HttpClient _httpClient;
    private readonly PayHereOptions _options;
    private readonly ILogger<PaymentGatewayService> _logger;

    public PaymentGatewayService(HttpClient httpClient, IOptions<PayHereOptions> options,
        ILogger<PaymentGatewayService> logger)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        if (_options.TimeoutSeconds > 0)
            _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    public async Task<PaymentGatewayChargeResult> CreateChargeAsync(PaymentGatewayChargeRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(_options.ChargeUrl))
        {
            return new PaymentGatewayChargeResult
            {
                Succeeded = false,
                Message = "PayHere ChargeUrl is not configured.",
                StatusCode = 0
            };
        }

        var payload = BuildChargePayload(request);
        using var content = new FormUrlEncodedContent(payload);

        using var response = await _httpClient.PostAsync(_options.ChargeUrl, content, cancellationToken);
        var raw = await response.Content.ReadAsStringAsync(cancellationToken);

        var parsed = TryParseResponse(raw);
        var result = new PaymentGatewayChargeResult
        {
            Succeeded = response.IsSuccessStatusCode && parsed.IsError != true,
            StatusCode = (int)response.StatusCode,
            Message = parsed.Message ?? response.ReasonPhrase,
            GatewayReference = parsed.GatewayReference,
            RawResponse = raw
        };

        if (!result.Succeeded)
        {
            _logger.LogWarning("PayHere charge failed with status {StatusCode}. Body: {Body}",
                result.StatusCode, raw);
        }

        return result;
    }

    private Dictionary<string, string> BuildChargePayload(PaymentGatewayChargeRequest request)
    {
        var payload = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(_options.ApiKeyFieldName) && !string.IsNullOrWhiteSpace(_options.ApiKey))
            payload[_options.ApiKeyFieldName] = _options.ApiKey;

        if (!string.IsNullOrWhiteSpace(_options.ApiSecretFieldName) &&
            !string.IsNullOrWhiteSpace(_options.ApiSecret))
            payload[_options.ApiSecretFieldName] = _options.ApiSecret;

        payload["order_id"] = request.OrderId;
        payload["amount"] = request.Amount.ToString("0.00", CultureInfo.InvariantCulture);
        payload["currency"] = request.Currency;
        payload["description"] = request.Description;

        payload["first_name"] = request.Customer.FirstName;
        payload["last_name"] = request.Customer.LastName;
        payload["email"] = request.Customer.Email;
        payload["phone"] = request.Customer.Phone;

        if (!string.IsNullOrWhiteSpace(request.Customer.Address))
            payload["address"] = request.Customer.Address!;
        if (!string.IsNullOrWhiteSpace(request.Customer.City))
            payload["city"] = request.Customer.City!;
        if (!string.IsNullOrWhiteSpace(request.Customer.Country))
            payload["country"] = request.Customer.Country!;

        if (!string.IsNullOrWhiteSpace(request.ReturnUrl))
            payload["return_url"] = request.ReturnUrl!;
        if (!string.IsNullOrWhiteSpace(request.CancelUrl))
            payload["cancel_url"] = request.CancelUrl!;
        if (!string.IsNullOrWhiteSpace(request.NotifyUrl))
            payload["notify_url"] = request.NotifyUrl!;

        if (request.AdditionalFields != null)
        {
            foreach (var kvp in request.AdditionalFields)
                payload[kvp.Key] = kvp.Value;
        }

        return payload;
    }

    private static (string? Message, string? GatewayReference, bool? IsError) TryParseResponse(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            return (null, null, null);

        try
        {
            using var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;

            if (root.ValueKind != JsonValueKind.Object)
                return (null, null, null);

            var message = GetString(root, "message") ?? GetString(root, "msg") ?? GetString(root, "error");
            var reference = GetString(root, "payment_id") ?? GetString(root, "reference") ??
                            GetString(root, "transaction_id");

            bool? isError = null;
            var status = GetString(root, "status") ?? GetString(root, "state");
            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalized = status.Trim().ToLowerInvariant();
                if (normalized is "success" or "ok" or "approved" or "paid")
                    isError = false;
                else if (normalized is "failed" or "error" or "declined" or "cancelled")
                    isError = true;
            }

            return (message, reference, isError);
        }
        catch (JsonException)
        {
            return (null, null, null);
        }
    }

    private static string? GetString(JsonElement root, string name)
    {
        if (root.TryGetProperty(name, out var value) && value.ValueKind == JsonValueKind.String)
            return value.GetString();

        return null;
    }
}