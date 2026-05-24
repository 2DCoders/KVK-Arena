using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Services;
using kvk.Gym.Domain;

namespace kvk.Gym.Services;

/// <summary>
/// Gym-specific adapter that wires the generic service to GymDbContext and DayEndRecord.
/// </summary>
public class GymDayEndService : GenericDayEndService<GymDbContext, DayEndRecord>
{
	public GymDayEndService(GymDbContext db)
		: base(
			db,
			ctx => ctx.Set<DayEndRecord>(),
			dto => new DayEndRecord
			{
				CurrentDate = dto.CurrentDate.Date,
				NextWorkingDate = dto.NextWorkingDate.Date,
				CashFromPrevDay = dto.CashFromPrevDay,
				ExpectedCashTotal = dto.ExpectedCashTotal,
				ActualCashCount = dto.ActualCashCount,
				// discrepancy will be set by the generic service before mapping, but keep mapping
				Discrepancy = dto.Discrepancy,
				Remark = dto.Remark,
				HoldForNextDay = dto.HoldForNextDay,
				CreatedAt = DateTime.UtcNow
			},
			entity => new DayEnd
			{
				CurrentDate = entity.CurrentDate,
				NextWorkingDate = entity.NextWorkingDate,
				CashFromPrevDay = entity.CashFromPrevDay,
				ExpectedCashTotal = entity.ExpectedCashTotal,
				ActualCashCount = entity.ActualCashCount,
				Discrepancy = entity.Discrepancy,
				Remark = entity.Remark,
				HoldForNextDay = entity.HoldForNextDay
			},
			currentDatePropertyName: "CurrentDate")
	{
	}
}


