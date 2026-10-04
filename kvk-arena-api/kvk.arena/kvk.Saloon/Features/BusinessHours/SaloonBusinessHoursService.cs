using kvk.BuildingBlocks.Common;
using Kvk.Cafe;
using kvk.Saloon.Domain;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
// For SaloonDbContext

namespace kvk.Saloon.Features.BusinessHours;

public class SaloonBusinessHoursService : ISaloonBusinessHoursService
{
    // Used only to seed the singleton row the very first time it's read,
    // before anyone has configured it from System Settings.
    private static readonly TimeSpan DefaultOpenTime = TimeSpan.FromHours(9);
    private static readonly TimeSpan DefaultCloseTime = TimeSpan.FromHours(19);
    private const int DefaultSlotIntervalMinutes = 15;

    private readonly SaloonDbContext _db;

    public SaloonBusinessHoursService(SaloonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<SaloonBusinessHoursResponse> GetAsync(CancellationToken cancellationToken = default)
    {
        var settings = await _db.SaloonBusinessHours
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (settings == null)
        {
            settings = new SaloonBusinessHours
            {
                OpenTime = DefaultOpenTime,
                CloseTime = DefaultCloseTime,
                SlotIntervalMinutes = DefaultSlotIntervalMinutes
            };

            _db.SaloonBusinessHours.Add(settings);
            await _db.SaveChangesAsync(cancellationToken);
        }

        return MapToResponse(settings);
    }

    public async Task<Result> UpdateAsync(SaloonBusinessHoursUpdateRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (request.CloseTime <= request.OpenTime)
            return Result.Failure("Close time must be after open time.");

        if (request.SlotIntervalMinutes <= 0)
            return Result.Failure("Slot interval must be greater than zero.");

        try
        {
            var settings = await _db.SaloonBusinessHours.FirstOrDefaultAsync(cancellationToken);

            if (settings == null)
            {
                settings = new SaloonBusinessHours();
                _db.SaloonBusinessHours.Add(settings);
            }

            settings.OpenTime = request.OpenTime;
            settings.CloseTime = request.CloseTime;
            settings.SlotIntervalMinutes = request.SlotIntervalMinutes;

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Business hours updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update business hours: {ex.Message}");
        }
    }

    private static SaloonBusinessHoursResponse MapToResponse(SaloonBusinessHours settings)
    {
        return new SaloonBusinessHoursResponse
        {
            Id = settings.Id,
            OpenTime = settings.OpenTime,
            CloseTime = settings.CloseTime,
            SlotIntervalMinutes = settings.SlotIntervalMinutes,
            LastModifiedAt = settings.LastModifiedAt
        };
    }
}
