using kvk.BuildingBlocks.Common;
using kvk.Gym.Features.Attendance;

namespace kvk.Gym.Services;

public interface IAttendanceService
{
    Task<Result> RecordScanAsync(RecordScanRequest request, CancellationToken cancellationToken = default);
}
