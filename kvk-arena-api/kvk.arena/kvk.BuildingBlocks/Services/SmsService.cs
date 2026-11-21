using System.Text.Json;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.Extensions.Configuration;

namespace kvk.BuildingBlocks.Services;

public class SmsService : ISmsService
{
    private static readonly HttpClient HttpClient = new();
    private readonly IConfiguration _configuration;
    const string SmsApiUrl = "https://smslenz.lk/api/send-sms";

    public SmsService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<Result> SendSingleMessageAsync(string phoneNumber, string message,
        CancellationToken cancellationToken = default)
    {
        using var response = await SendSingleRequestAsync(phoneNumber, message, cancellationToken);
        return response.IsSuccessStatusCode ? Result.Success() : Result.Failure("Failed to send SMS");
    }

    public async Task<int?> SendSingleMessageWithPagesAsync(string phoneNumber, string message,
        CancellationToken cancellationToken = default)
    {
        using var response = await SendSingleRequestAsync(phoneNumber, message, cancellationToken);
        if ((int)response.StatusCode >= 500)
            throw new HttpRequestException("SMSlenz returned a server error.");
        if (!response.IsSuccessStatusCode) return null;

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var json = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        var body = json.RootElement;
        if (body.ValueKind == JsonValueKind.Object && body.TryGetProperty("success", out var success))
        {
            if (success.ValueKind == JsonValueKind.False) return null;
            if (success.ValueKind == JsonValueKind.True && body.TryGetProperty("data", out var data) &&
                data.ValueKind == JsonValueKind.Object && data.TryGetProperty("pages", out var pages) &&
                pages.ValueKind == JsonValueKind.Number && pages.TryGetInt32(out var count) && count > 0)
                return count;
        }
        throw new JsonException("SMSlenz returned an unexpected response.");
    }

    private async Task<HttpResponseMessage> SendSingleRequestAsync(string phoneNumber, string message,
        CancellationToken cancellationToken)
    {
        phoneNumber = phoneNumber.StartsWith("0") ? $"+94{phoneNumber[1..]}" : phoneNumber;
        using var requestContent = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("user_id", _configuration["Sms:UserId"]!),
            new KeyValuePair<string, string>("api_key", _configuration["Sms:ApiKey"]!),
            new KeyValuePair<string, string>("sender_id", _configuration["Sms:SenderId"]!),
            new KeyValuePair<string, string>("contact", phoneNumber),
            new KeyValuePair<string, string>("message", message),
        });

        return await HttpClient.PostAsync(SmsApiUrl, requestContent, cancellationToken);
    }

    public async Task<Result> SendBulkMessageAsync(
        IEnumerable<BulkSmsItem> messages,
        CancellationToken cancellationToken = default)
    {
        var tasks = messages.Select(async item =>
        {
            var phoneNumber = item.PhoneNumber.StartsWith("0")
                ? $"+94{item.PhoneNumber[1..]}"
                : item.PhoneNumber;

            var requestContent = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>(
                    "user_id",
                    _configuration["Sms:UserId"]!),

                new KeyValuePair<string, string>(
                    "api_key",
                    _configuration["Sms:ApiKey"]!),

                new KeyValuePair<string, string>(
                    "sender_id",
                    _configuration["Sms:SenderId"]!),

                new KeyValuePair<string, string>(
                    "contact",
                    phoneNumber),

                new KeyValuePair<string, string>(
                    "message",
                    item.Message)
            });

            var response = await HttpClient.PostAsync(
                SmsApiUrl,
                requestContent,
                cancellationToken);

            return response.IsSuccessStatusCode;
        });

        var results = await Task.WhenAll(tasks);

        return results.All(x => x)
            ? Result.Success()
            : Result.Failure("Some SMS messages failed to send.");
    }


    public class BulkSmsItem
    {
        public required string PhoneNumber { get; set; }
        public required string Message { get; set; }
    }
}
