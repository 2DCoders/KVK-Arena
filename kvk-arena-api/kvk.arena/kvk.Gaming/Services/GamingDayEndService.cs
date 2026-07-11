using kvk.Gaming.Domain;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Services;

public class GamingDayEndService : IDayEndService
{
    private readonly IHolidayService _holidayService;
    private readonly GenericDayEndService<GamingDbContext, GamingDayEnd> _genericDayEndService;

    public GamingDayEndService(GamingDbContext db,IHolidayService holidayService)
    {
        _holidayService = holidayService;
        _genericDayEndService = new GenericDayEndService<GamingDbContext, GamingDayEnd>(
            db: db,
            setSelector: context => context.GamingDayEnds,
            toEntity: dto => new GamingDayEnd 
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
            } // Map entity to DTO
        );
    }

    public Task<Result> CreateDayEndAsync(DayEnd dayEnd, CancellationToken cancellationToken = default)
    {
        return _genericDayEndService.CreateDayEndAsync(dayEnd, cancellationToken);
    }

    public Task<List<DayEnd>> GetDayEndsAsync(DateTime? forDate = null, CancellationToken cancellationToken = default)
    {
        return _genericDayEndService.GetDayEndsAsync(forDate, cancellationToken);
    }
}