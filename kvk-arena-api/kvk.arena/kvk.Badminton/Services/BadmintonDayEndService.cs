using kvk.Badminton.Domain;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using Microsoft.EntityFrameworkCore;

namespace kvk.Badminton.Services;

public class BadmintonDayEndService : GenericDayEndService<BadmintonDbContext, BadmintonDayEnd>
{
    private readonly GenericDayEndService<BadmintonDbContext, BadmintonDayEnd> _genericDayEndService;

    public BadmintonDayEndService(BadmintonDbContext db)
        : base(
            db,
            ctx => ctx.Set<BadmintonDayEnd>(),
            dto => new BadmintonDayEnd

            {
                CurrentDate = dto.CurrentDate,
                Remark = dto.Remark,
                ExpectedCashTotal = dto.ExpectedCashTotal,
                ActualCashCount = dto.ActualCashCount,
                Discrepancy = dto.Discrepancy,
                HoldForNextDay = dto.HoldForNextDay,
                CashFromPrevDay = dto.CashFromPrevDay
            }, // Map DTO to entity
            toDto: entity => new DayEnd
            {
                CurrentDate = entity.CurrentDate,
                Remark = entity.Remark,
                ExpectedCashTotal = entity.ExpectedCashTotal,
                ActualCashCount = entity.ActualCashCount,
                Discrepancy = entity.Discrepancy,
                HoldForNextDay = entity.HoldForNextDay,
                CashFromPrevDay = entity.CashFromPrevDay
            },
            currentDatePropertyName: "CurrentDate"// Map entity to DTO
        )
    {
    }
}

// public Task<Result> CreateDayEndAsync(BadmintonDayEnd dayEnd, CancellationToken cancellationToken = default)
// {
//     return _genericDayEndService.CreateDayEndAsync(dayEnd, cancellationToken);
// }
//
// public Task<List<DayEnd>> GetDayEndsAsync(DateTime? forDate = null, CancellationToken cancellationToken = default)
// {
//     return _genericDayEndService.GetDayEndsAsync(forDate, cancellationToken);
// }

