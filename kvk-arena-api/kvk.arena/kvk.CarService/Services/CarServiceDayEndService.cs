using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using kvk.CarService.Domain;

namespace kvk.CarService.Services;

public class CarServiceDayEndService : GenericDayEndService<CarServiceDbContext, CarServiceDayEnd>
{
    private readonly IHolidayService _holidayService;
    private readonly GenericDayEndService<CarServiceDbContext, CarServiceDayEnd> _genericDayEndService;

    public CarServiceDayEndService(CarServiceDbContext db, IHolidayService holidayService)
        : base(
            db,
            ctx => ctx.Set<CarServiceDayEnd>(),
            dto => new CarServiceDayEnd

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