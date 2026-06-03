namespace kvk.BuildingBlocks;

public class PayHereOptions
{
    public const string SectionName = "PayHere";

    public string MerchantId { get; set; } = string.Empty;
    public string MerchantSecret { get; set; } = string.Empty;
    public string Currency { get; set; } = "LKR";
    public string ChargeUrl { get; set; } = string.Empty;
    public int TimeoutSeconds { get; set; } = 30;
}
