using kvk.Badminton.Domain;
using kvk.Badminton.Interfaces;
using kvk.Badminton.Persistence;
using kvk.BuildingBlocks.Common;
using Microsoft.EntityFrameworkCore;

namespace kvk.Badminton.Features.Court;

public class CourtService : ICourtService
{
    private readonly BadmintonDbContext _db;

    public CourtService(BadmintonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<CourtResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Courts
            .AsNoTracking()
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CourtResponse
            {
                Id = c.Id,
                Name = c.Name,
                Status = c.Status,
                PricePerSlot = c.PricePerSlot,
                CreatedAt = c.CreatedAt,
                LastModifiedAt = c.LastModifiedAt
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<CourtResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var court = await _db.Courts
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (court == null)
                throw new KeyNotFoundException("Court not found");

            var response = MapToResponse(court);
            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get court: {ex.Message}");
        }
    }

    public async Task<Result> CreateAsync(CourtCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Court name is required");

        if (request.PricePerSlot < 0)
            return Result.Failure("Price per slot cannot be negative");

        try
        {
            var court = new Domain.Court
            {
                Name = request.Name,
                PricePerSlot = request.PricePerSlot,
                Status = Enums.CourtStatus.Active
            };

            _db.Set<Domain.Court>().Add(court);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Court created successfully");

        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create court: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(CourtUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Court name is required");

        try
        {
            var court = await _db.Courts
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (court == null)
                return Result.Failure("Court not found");

            court.Name = request.Name;
            court.PricePerSlot = request.PricePerSlot;
            court.Status = request.Status;

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Court updated successfully");

        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update court: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var court = await _db.Courts
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (court == null)
                return Result.Failure("Court not found");

            // Check for dependencies like bookings if necessary before deletion
            // Or use soft delete if that is the pattern
            
            _db.Courts.Remove(court);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Court deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete court: {ex.Message}");
        }
    }

    private static CourtResponse MapToResponse(Domain.Court court)
    {
        return new CourtResponse
        {
            Id = court.Id,
            Name = court.Name,
            Status = court.Status,
            PricePerSlot = court.PricePerSlot,
            CreatedAt = court.CreatedAt,
            LastModifiedAt = court.LastModifiedAt
        };
    }
}