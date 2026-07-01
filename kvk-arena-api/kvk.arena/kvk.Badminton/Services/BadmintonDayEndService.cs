using kvk.Badminton.Domain;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using Microsoft.EntityFrameworkCore;

namespace kvk.Badminton.Services;

public class BadmintonDayEndService : GenericDayEndService<BadmintonDbContext, BadmintonDayEnd>
{
    private readonly IHolidayService _holidayService;
    private readonly GenericDayEndService<BadmintonDbContext, BadmintonDayEnd> _genericDayEndService;

    public BadmintonDayEndService(BadmintonDbContext db,IHolidayService holidayService)
        : base(
            db,
            ctx => ctx.Set<BadmintonDayEnd>(),
            dto => new BadmintonDayEnd

            {
                CurrentDate = holidayService.GetNextWorkingDayAsync(dto.CurrentDate).Result,
                NextWorkingDate = holidayService.GetNextWorkingDayAsync(holidayService.GetNextWorkingDayAsync(dto.CurrentDate).Result).Result,
                Remark = dto.Remark,
                ExpectedCashTotal = dto.ExpectedCashTotal,
                ActualCashCount = dto.ActualCashCount,
                Discrepancy = dto.Discrepancy,
                CashFromPrevDay = dto.HoldForNextDay
            }, // Map DTO to entity
            toDto: entity => new DayEnd
            {
                CurrentDate = entity.CurrentDate,
                Remark = entity.Remark,
                ExpectedCashTotal = entity.ExpectedCashTotal,
                ActualCashCount = entity.ActualCashCount,
                Discrepancy = entity.Discrepancy,
                CashFromPrevDay = entity.CashFromPrevDay
            },
            currentDatePropertyName: "CurrentDate"// Map entity to DTO
        )
    {
        _holidayService = holidayService;
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

