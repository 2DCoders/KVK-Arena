using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Domain;

public class GymPaymentReceipt : AuditableEntity
{
    public const int MaximumBytes = 5 * 1024 * 1024;
    public const string InvalidFileMessage = "Choose a PDF, PNG or JPEG receipt up to 5 MB.";
    public Guid? PaymentRecordId { get; set; }
    public Guid? DayPassMemberId { get; set; }
    public required byte[] Document { get; set; }
    public required string ContentType { get; set; }

    public static string? DetectContentType(ReadOnlySpan<byte> bytes)
    {
        if (bytes.Length is < 1 or > MaximumBytes) return null;
        if (bytes.StartsWith("%PDF-"u8)) return "application/pdf";
        if (bytes.StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return "image/png";
        return bytes.StartsWith(new byte[] { 255, 216, 255 }) ? "image/jpeg" : null;
    }
}
