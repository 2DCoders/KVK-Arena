namespace kvk.BuildingBlocks;

public class PayHereOptions
{
    public const string SectionName = "PayHere";

    public string ApiKey { get; set; } = string.Empty;
    public string ApiSecret { get; set; } = string.Empty;
    public string ChargeUrl { get; set; } = string.Empty;
    public string ApiKeyFieldName { get; set; } = "api_key";
    public string ApiSecretFieldName { get; set; } = "api_secret";
    public int TimeoutSeconds { get; set; } = 30;
}

