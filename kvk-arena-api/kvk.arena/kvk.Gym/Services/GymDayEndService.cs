using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Services;
using kvk.Gym.Domain;
using kvk.BuildingBlocks.Interfaces; // Added for IHolidayService

namespace kvk.Gym.Services;

/// <summary>
/// Gym-specific adapter that wires the generic service to GymDbContext and DayEndRecord.
/// </summary>
public class GymDayEndService : GenericDayEndService<GymDbContext, DayEndRecord>
{
    private readonly IHolidayService _holidayService; // Declare private field

    public GymDayEndService(GymDbContext db, IHolidayService holidayService) // Inject IHolidayService
        : base(
            db,
            ctx => ctx.Set<DayEndRecord>(),
            dto => new DayEndRecord
            {
                CurrentDate = holidayService.GetNextWorkingDayAsync(dto.CurrentDate).Result,
                //get from identity.Holiday table
                NextWorkingDate = holidayService
                    .GetNextWorkingDayAsync(holidayService.GetNextWorkingDayAsync(dto.CurrentDate).Result).Result,
                CashFromPrevDay = dto.HoldForNextDay,
                ExpectedCashTotal = dto.ExpectedCashTotal,
                ActualCashCount = dto.ActualCashCount,
                Discrepancy = dto.Discrepancy,
                Remark = dto.Remark ?? string.Empty,
                HoldForNextDay = 0,
                CreatedAt = DateTime.Now
            },
            entity => new DayEnd
            {
                CurrentDate = entity.CurrentDate,
                ExpectedCashTotal = entity.ExpectedCashTotal,
                ActualCashCount = entity.ActualCashCount,
                Discrepancy = entity.Discrepancy,
                Remark = entity.Remark,
                HoldForNextDay = entity.HoldForNextDay
            },
            currentDatePropertyName: "CurrentDate")
    {
        _holidayService = holidayService; // Assign injected service
    }
}