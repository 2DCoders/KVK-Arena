using kvk.BuildingBlocks.Common;

namespace kvk.Gym.Domain;

public class MemberAttendance : AuditableEntity
{
	public Guid MembershipId { get; set; }

	// Navigation back to membership to enable cascade configuration
	public Membership? Membership { get; set; }
	public DateTime ScanTime { get; set; }
	public int FingerprintIndex { get; set; }
	public string DeviceId { get; set; } = string.Empty;
	public string? RoomId { get; set; }
	public string? RawMetadata { get; set; }
}