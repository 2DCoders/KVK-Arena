namespace kvk.Gym.Features.Attendance;

public class RecordScanRequest
{
    public string DeviceFingerprintId { get; set; } = string.Empty;
    public string? DeviceId { get; set; }
    public string? RoomId { get; set; }
    public DateTime? ScanTime { get; set; }
    public string? RawMetadata { get; set; }
}
