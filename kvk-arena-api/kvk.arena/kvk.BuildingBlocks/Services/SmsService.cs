using System.Text.Json;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace kvk.BuildingBlocks.Services;

public class SmsService(IConfiguration configuration, ISmsAttemptStore attempts, ILogger<SmsService> logger) : ISmsService
{
    private static readonly HttpClient HttpClient = new();
    private const string SmsApiUrl = "https://smslenz.lk/api/send-sms";

    public async Task<Result> SendSingleMessageAsync(string phoneNumber, string message,
        CancellationToken cancellationToken = default)
    {
        // Existing callers use the HTTP result. Usage requires a positive page count from SMSlenz.
        var (_, httpSuccess) = await SendTrackedAsync(phoneNumber, message, false, cancellationToken);
        return httpSuccess ? Result.Success() : Result.Failure("Failed to send SMS");
    }

    public async Task<int?> SendSingleMessageWithPagesAsync(string phoneNumber, string message,
        CancellationToken cancellationToken = default)
    {
        var (pages, _) = await SendTrackedAsync(phoneNumber, message, true, cancellationToken);
        return pages;
    }

    private async Task<(int? Pages, bool HttpSuccess)> SendTrackedAsync(
        string phoneNumber, string message, bool adminBatch, CancellationToken cancellationToken)
    {
        phoneNumber = phoneNumber.StartsWith("0") ? $"+94{phoneNumber[1..]}" : phoneNumber;
        using var requestContent = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("user_id", configuration["Sms:UserId"]!),
            new KeyValuePair<string, string>("api_key", configuration["Sms:ApiKey"]!),
            new KeyValuePair<string, string>("sender_id", configuration["Sms:SenderId"]!),
            new KeyValuePair<string, string>("contact", phoneNumber),
            new KeyValuePair<string, string>("message", message),
        });

        Guid id;
        try
        {
            id = await attempts.StartAsync(phoneNumber, adminBatch, cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            logger.LogError("Could not record SMS attempt before sending ({ErrorType})", ex.GetType().Name);
            return (null, false);
        }

        var status = SmsAttemptStatus.Unknown;
        int? pages = null;
        try
        {
            using var response = await HttpClient.PostAsync(SmsApiUrl, requestContent, cancellationToken);
            if ((int)response.StatusCode >= 500)
            {
                if (adminBatch) throw new HttpRequestException("SMSlenz returned a server error.");
                return (null, false);
            }
            if (!response.IsSuccessStatusCode)
            {
                status = SmsAttemptStatus.Failed;
                return (null, false);
            }

            try
            {
                await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
                using var json = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
                var body = json.RootElement;
                if (body.ValueKind == JsonValueKind.Object && body.TryGetProperty("success", out var success))
                {
                    if (success.ValueKind == JsonValueKind.False)
                    {
                        status = SmsAttemptStatus.Failed;
                        return (null, true);
                    }
                    if (success.ValueKind == JsonValueKind.True && body.TryGetProperty("data", out var data) &&
                        data.ValueKind == JsonValueKind.Object && data.TryGetProperty("pages", out var pageCount) &&
                        pageCount.ValueKind == JsonValueKind.Number && pageCount.TryGetInt32(out var count) && count > 0)
                    {
                        pages = count;
                        status = SmsAttemptStatus.Accepted;
                        return (pages, true);
                    }
                }
                throw new JsonException("SMSlenz returned an unexpected response.");
            }
            catch (JsonException) when (!adminBatch)
            {
                return (null, true);
            }
        }
        finally
        {
            try
            {
                using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                await attempts.CompleteAsync(id, status, pages, timeout.Token);
            }
            catch (Exception ex)
            {
                logger.LogError("Could not record SMS outcome for attempt {AttemptId} ({ErrorType})", id, ex.GetType().Name);
            }
        }
    }

    public async Task<Result> SendBulkMessageAsync(
        IEnumerable<BulkSmsItem> messages, CancellationToken cancellationToken = default)
    {
        var results = await Task.WhenAll(messages.Select(item =>
            SendSingleMessageAsync(item.PhoneNumber, item.Message, cancellationToken)));

        return results.All(x => x.Succeeded)
            ? Result.Success()
            : Result.Failure("Some SMS messages failed to send.");
    }

    public class BulkSmsItem
    {
        public required string PhoneNumber { get; set; }
        public required string Message { get; set; }
    }
}
