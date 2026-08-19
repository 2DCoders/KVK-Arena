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
        phoneNumber = phoneNumber.StartsWith("0") ? $"+94{phoneNumber[1..]}" : phoneNumber;


        var httpClient = new HttpClient();
        var requestContent = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("user_id", _configuration["Sms:UserId"]!),
            new KeyValuePair<string, string>("api_key", _configuration["Sms:ApiKey"]!),
            new KeyValuePair<string, string>("sender_id", _configuration["Sms:SenderId"]!),
            new KeyValuePair<string, string>("contact", phoneNumber),
            new KeyValuePair<string, string>("message", message),
        });

        var response = await httpClient.PostAsync(SmsApiUrl, requestContent, cancellationToken);
        if (response.IsSuccessStatusCode)
        {
            return Result.Success();
        }
        else
        {
            return Result.Failure("Failed to send SMS");
        }
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