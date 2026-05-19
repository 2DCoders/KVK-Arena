using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using Microsoft.EntityFrameworkCore;
using kvk.Gym.Features.Attendance;

namespace kvk.Gym.Services;

public class AttendanceService : IAttendanceService
{
    private readonly GymDbContext _db;

    public AttendanceService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> RecordScanAsync(RecordScanRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        try
        {
            // try to find a member by device fingerprint id
            var member = await _db.Memberships
                .SingleOrDefaultAsync(m => m.DeviceFingerprintId1 == request.DeviceFingerprintId || m.DeviceFingerprintId2 == request.DeviceFingerprintId, cancellationToken);

            var attendance = new MemberAttendance
            {
                MembershipId = member?.Id ?? Guid.Empty,
                ScanTime = request.ScanTime ?? DateTime.UtcNow,
                DeviceId = request.DeviceId ?? string.Empty,
                RoomId = request.RoomId,
                RawMetadata = request.RawMetadata
            };

            if (member != null)
            {
                attendance.MembershipId = member.Id;
                attendance.FingerprintIndex = member.DeviceFingerprintId1 == request.DeviceFingerprintId ? 1 : 2;
            }
            else
            {
                // unmatched attendance; FingerprintIndex 0
                attendance.FingerprintIndex = 0;
            }

            _db.MemberAttendances.Add(attendance);
            await _db.SaveChangesAsync(cancellationToken);

            if (member != null)
            {
                return Result.Success("Attendance recorded").WithData("memberId", member.Id);
            }

            return Result.Success("Attendance recorded (unmatched)").WithData("matched", false);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to record attendance: {ex.Message}");
        }
    }
}

