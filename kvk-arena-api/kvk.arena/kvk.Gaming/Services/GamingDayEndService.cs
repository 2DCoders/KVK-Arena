using kvk.Gaming.Domain;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gaming.Services;

public class GamingDayEndService : IDayEndService
{
    private readonly GenericDayEndService<GamingDbContext, GamingDayEnd> _genericDayEndService;

    public GamingDayEndService(GamingDbContext db)
    {
        _genericDayEndService = new GenericDayEndService<GamingDbContext, GamingDayEnd>(
            db: db,
            setSelector: context => context.GamingDayEnds,
            toEntity: dto => new GamingDayEnd 
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