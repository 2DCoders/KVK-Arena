namespace kvk.BuildingBlocks.Common;

public class CouponValidationResult
{
    public bool IsValid { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? ErrorMessage { get; set; }
}
