// using kvk.BuildingBlocks.Common;
// using kvk.BuildingBlocks.Interfaces;
// using kvk.Gym.Domain;
// using Microsoft.EntityFrameworkCore;
//
// namespace kvk.Gym.Services;
//
// public class DayEndService : IDayEndService
// {
//     private readonly GymDbContext _db;
//
//     public DayEndService(GymDbContext db)
//     {
//         _db = db ?? throw new ArgumentNullException(nameof(db));
//     }
//
//     public async Task<Result> CreateDayEndAsync(DayEnd dayEnd, CancellationToken cancellationToken = default)
//     {
//         // dayEnd is non-nullable per interface; model binding will ensure a body is provided.
//         if (string.IsNullOrWhiteSpace(dayEnd.Remark))
//             return Result.Failure("Remark is required");
//
//         // compute discrepancy as (Actual - Expected)
//         dayEnd.Discrepancy = dayEnd.ActualCashCount - dayEnd.ExpectedCashTotal;
//
//         var entity = new DayEndRecord
//         {
//             CurrentDate = dayEnd.CurrentDate.Date,
//             NextWorkingDate = dayEnd.NextWorkingDate.Date,
//             CashFromPrevDay = dayEnd.CashFromPrevDay,
//             ExpectedCashTotal = dayEnd.ExpectedCashTotal,
//             ActualCashCount = dayEnd.ActualCashCount,
//             Discrepancy = dayEnd.Discrepancy,
//             Remark = dayEnd.Remark,
//             HoldForNextDay = dayEnd.HoldForNextDay,
//             CreatedAt = DateTime.UtcNow
//         };
//
//         await _db.DayEnds.AddAsync(entity, cancellationToken);
//         await _db.SaveChangesAsync(cancellationToken);
//
//         return Result.Success("Day end saved");
//     }
//
//     public async Task<List<DayEnd>> GetDayEndsAsync(DateTime? forDate = null, CancellationToken cancellationToken = default)
//     {
//         var query = _db.DayEnds.AsNoTracking().AsQueryable();
//
//         if (forDate.HasValue)
//         {
//             var date = forDate.Value.Date;
//             query = query.Where(d => d.CurrentDate == date);
//         }
//
//         var list = await query.OrderByDescending(d => d.CurrentDate)
//             .Take(100)
//             .ToListAsync(cancellationToken);
//
//         return list.Select(d => new DayEnd
//         {
//             CurrentDate = d.CurrentDate,
//             NextWorkingDate = d.NextWorkingDate,
//             CashFromPrevDay = d.CashFromPrevDay,
//             ExpectedCashTotal = d.ExpectedCashTotal,
//             ActualCashCount = d.ActualCashCount,
//             Discrepancy = d.Discrepancy,
//             Remark = d.Remark,
//             HoldForNextDay = d.HoldForNextDay
//         }).ToList();
//     }
// }
//
//
