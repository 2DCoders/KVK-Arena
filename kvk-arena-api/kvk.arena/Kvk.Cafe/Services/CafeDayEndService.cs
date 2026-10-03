using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using Kvk.Cafe;
using kvk.Cafe.Domain;

namespace kvk.CarService.Services;

public class CafeDayEndService : GenericDayEndService<CafeDbContext, CafeDayEnd>
{
    private readonly IHolidayService _holidayService;
    private readonly GenericDayEndService<CafeDbContext, CafeDayEnd> _genericDayEndService;

    public CafeDayEndService(CafeDbContext db, IHolidayService holidayService)
        : base(
            db,
            ctx => ctx.Set<CafeDayEnd>(),
            dto => new CafeDayEnd

            {
                CurrentDate = holidayService.GetNextWorkingDayAsync(dto.CurrentDate).Result,
                NextWorkingDate = holidayService
                    .GetNextWorkingDayAsync(holidayService.GetNextWorkingDayAsync(dto.CurrentDate).Result).Result,
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
            currentDatePropertyName: "CurrentDate" // Map entity to DTO
        )
    {
        _holidayService = holidayService;
    }
}