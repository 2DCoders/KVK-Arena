using kvk.BuildingBlocks.Common;
using Kvk.Cafe;
using kvk.Saloon.Domain;
using kvk.Saloon.Interfaces;
using Microsoft.EntityFrameworkCore;
// For SaloonDbContext

namespace kvk.Saloon.Features.Staff;

public class SaloonStaffService : ISaloonStaffService
{
    private readonly SaloonDbContext _db;

    public SaloonStaffService(SaloonDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<IEnumerable<SaloonStaffResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.SaloonStaffs
            .AsNoTracking()
            .OrderBy(s => s.CreatedAt)
            .Select(s => new SaloonStaffResponse
            {
                Id = s.Id,
                Name = s.Name,
                Phone = s.Phone,
                Designation = s.Designation,
                IsActive = s.IsActive
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SaloonStaffResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            throw new ArgumentException("Id cannot be empty", nameof(id));

        try
        {
            var staff = await _db.SaloonStaffs
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (staff == null)
                throw new KeyNotFoundException("Staff member not found");

            return MapToResponse(staff);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to get staff member: {ex.Message}");
        }
    }

    public async Task<Result> CreateAsync(SaloonStaffCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Staff name is required");

        try
        {
            var staff = new SaloonStaff
            {
                Name = request.Name,
                Phone = request.Phone,
                Designation = request.Designation,
                IsActive = request.IsActive
            };

            _db.Set<SaloonStaff>().Add(staff);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Staff member created successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create staff member: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(SaloonStaffUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Staff name is required");

        try
        {
            var staff = await _db.SaloonStaffs
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (staff == null)
                return Result.Failure("Staff member not found");

            staff.Name = request.Name;
            staff.Phone = request.Phone;
            staff.Designation = request.Designation;
            staff.IsActive = request.IsActive;

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Staff member updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update staff member: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var staff = await _db.SaloonStaffs
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (staff == null)
                return Result.Failure("Staff member not found");

            _db.SaloonStaffs.Remove(staff);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Staff member deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete staff member: {ex.Message}");
        }
    }

    private static SaloonStaffResponse MapToResponse(SaloonStaff staff)
    {
        return new SaloonStaffResponse
        {
            Id = staff.Id,
            Name = staff.Name,
            Phone = staff.Phone,
            Designation = staff.Designation,
            IsActive = staff.IsActive,
        };
    }
}
