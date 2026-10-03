using kvk.BuildingBlocks.Common;
using Kvk.Cafe;
using kvk.Saloon.Domain;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
// For SaloonDbContext

namespace kvk.Saloon.Features.StaffSchedule;

public class SaloonStaffScheduleService : ISaloonStaffScheduleService
{
    private readonly SaloonDbContext _db;

    public SaloonStaffScheduleService(SaloonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<SaloonStaffScheduleResponse>> GetAllAsync(Guid staffId, CancellationToken cancellationToken = default)
    {
        return await _db.SaloonStaffSchedules
            .AsNoTracking()
            .Where(s => s.SaloonStaffId == staffId)
            .OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartTime)
            .Select(s => new SaloonStaffScheduleResponse
            {
                Id = s.Id,
                SaloonStaffId = s.SaloonStaffId,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsActive = s.IsActive,
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SaloonStaffScheduleResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var schedule = await _db.SaloonStaffSchedules
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (schedule == null)
                throw new KeyNotFoundException("Schedule not found");

            return MapToResponse(schedule);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get schedule: {ex.Message}");
        }
    }

    public async Task<Result> CreateAsync(SaloonStaffScheduleCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.SaloonStaffId <= Guid.Empty)
            return Result.Failure("Staff ID is required");

        if (request.EndTime <= request.StartTime)
            return Result.Failure("End time must be after start time");

        try
        {
            var schedule = new SaloonStaffSchedule
            {
                SaloonStaffId = request.SaloonStaffId,
                DayOfWeek = request.DayOfWeek,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                IsActive = request.IsActive
            };

            _db.Set<SaloonStaffSchedule>().Add(schedule);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Schedule created successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create schedule: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(SaloonStaffScheduleUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.EndTime <= request.StartTime)
            return Result.Failure("End time must be after start time");

        try
        {
            var schedule = await _db.SaloonStaffSchedules
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (schedule == null)
                return Result.Failure("Schedule not found");

            schedule.DayOfWeek = request.DayOfWeek;
            schedule.StartTime = request.StartTime;
            schedule.EndTime = request.EndTime;
            schedule.IsActive = request.IsActive;

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Schedule updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update schedule: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var schedule = await _db.SaloonStaffSchedules
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (schedule == null)
                return Result.Failure("Schedule not found");

            _db.SaloonStaffSchedules.Remove(schedule);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Schedule deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete schedule: {ex.Message}");
        }
    }

    private static SaloonStaffScheduleResponse MapToResponse(SaloonStaffSchedule schedule)
    {
        return new SaloonStaffScheduleResponse
        {
            Id = schedule.Id,
            SaloonStaffId = schedule.SaloonStaffId,
            DayOfWeek = schedule.DayOfWeek,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            IsActive = schedule.IsActive,
        };
    }
}
