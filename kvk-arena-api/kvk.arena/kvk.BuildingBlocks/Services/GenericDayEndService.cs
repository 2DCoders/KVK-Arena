using Microsoft.EntityFrameworkCore;
using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Interfaces;

namespace kvk.BuildingBlocks.Services;

/// <summary>
/// Generic reusable DayEnd service that works with any DbContext and entity type.
/// Mapping between the shared DTO and the module entity is supplied by delegates.
/// </summary>
public class GenericDayEndService<TContext, TEntity> : IDayEndService
    where TContext : DbContext
    where TEntity : class
{
    private readonly TContext _db;
    private readonly Func<TContext, DbSet<TEntity>> _setSelector;
    private readonly Func<DayEnd, TEntity> _toEntity;
    private readonly Func<TEntity, DayEnd> _toDto;
    private readonly Func<TEntity, TEntity>? _preSaveEntityModifier;
    private readonly string _currentDatePropertyName;

    public GenericDayEndService(
        TContext db,
        Func<TContext, DbSet<TEntity>> setSelector,
        Func<DayEnd, TEntity> toEntity,
        Func<TEntity, DayEnd> toDto,
        string currentDatePropertyName = "CurrentDate",
        Func<TEntity, TEntity>? preSaveEntityModifier = null)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _setSelector = setSelector ?? throw new ArgumentNullException(nameof(setSelector));
        _toEntity = toEntity ?? throw new ArgumentNullException(nameof(toEntity));
        _toDto = toDto ?? throw new ArgumentNullException(nameof(toDto));
        _currentDatePropertyName = currentDatePropertyName ?? throw new ArgumentNullException(nameof(currentDatePropertyName));
        _preSaveEntityModifier = preSaveEntityModifier;
    }

    public async Task<Result> CreateDayEndAsync(DayEnd dayEnd, CancellationToken cancellationToken = default)
    {
        // Delete existing records for the current date before adding a new one
        var existingRecords = await _setSelector(_db)
            .ToListAsync(cancellationToken);

        if (existingRecords.Any())
        {
            _setSelector(_db).RemoveRange(existingRecords);
        }

        var entity = _toEntity(dayEnd);
        await _setSelector(_db).AddAsync(entity, cancellationToken);

        try
        {
            await _db.SaveChangesAsync(cancellationToken);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
      
        return Result.Success("Day end saved");
    }

    public async Task<List<DayEnd>> GetDayEndsAsync(DateTime? forDate = null, CancellationToken cancellationToken = default)
    {
        var set = _setSelector(_db).AsNoTracking().AsQueryable();

        if (forDate.HasValue)
        {
            var d = forDate.Value.Date;
            set = set.Where(e => EF.Property<DateTime>(e, _currentDatePropertyName).Date == d); // Ensure date-only comparison
        }

        var list = await set.OrderByDescending(e => EF.Property<DateTime>(e, _currentDatePropertyName))
            .Take(100)
            .ToListAsync(cancellationToken);

        return list.Select(e => _toDto(e)).ToList();
    }
    
    
    
    
    
    
}