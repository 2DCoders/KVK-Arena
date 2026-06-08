using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using kvk.Gym.Persistence;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gym.Features.Trainers;

public class TrainerService
{
    private readonly GymDbContext _db;

    public TrainerService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(TrainerCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.UserName))
            return Result.Failure("Name is required");

        if (string.IsNullOrWhiteSpace(request.Email))
            return Result.Failure("Email is required");

        try
        {
            var entity = new Trainer
            {
                UserName = request.UserName,
                Email = request.Email,
                Phone = request.PhoneNumber,
                Specialization = request.Specialization,
                YearsOfExperience = request.YearsOfExperience,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = string.Empty, // Password handling is out of scope for this example
                Status = "Active"
            };

            _db.Set<Trainer>().Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new TrainerResponse
            {
                Id = entity.Id,
                Name = entity.UserName,
                Email = entity.Email,
                PhoneNumber = entity.Phone,
                Specialization = entity.Specialization,
                YearsOfExperience = entity.YearsOfExperience,
                Rating = entity.Rating,
                CreatedAt = entity.CreatedAt,
                LastModifiedAt = entity.LastModifiedAt
            };

            return Result.Success("Created successfully")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create: {ex.Message}");
        }
    }

    public async Task<Result> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var entity = await _db.Set<Trainer>()
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (entity == null)
                return Result.Failure("Not found");

            var response = new TrainerResponse
            {
                Id = entity.Id,
                Name = entity.UserName,
                Email = entity.Email,
                PhoneNumber = entity.Phone,
                Specialization = entity.Specialization,
                YearsOfExperience = entity.YearsOfExperience,
                Rating = entity.Rating,
                CreatedAt = entity.CreatedAt,
                LastModifiedAt = entity.LastModifiedAt
            };

            return Result.Success().WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to fetch: {ex.Message}");
        }
    }
    
    public async Task<Result> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var entities = await _db.Set<Trainer>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var response = entities.Select(entity => new TrainerResponse
            {
                Id = entity.Id,
                Name = entity.UserName,
                Email = entity.Email,
                PhoneNumber = entity.Phone,
                Specialization = entity.Specialization,
                YearsOfExperience = entity.YearsOfExperience,
                Rating = entity.Rating,
                CreatedAt = entity.CreatedAt,
                LastModifiedAt = entity.LastModifiedAt
            }).ToList();

            return Result.Success().WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to fetch: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(Guid id, TrainerUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        if (request == null)
            return Result.Failure("Request cannot be null");

        try
        {
            var entity = await _db.Set<Trainer>().FindAsync(id);

            if (entity == null)
                return Result.Failure("Not found");

            entity.UserName = request.Name;
            entity.Email = request.Email;
            entity.Phone = request.PhoneNumber;
            entity.Specialization = request.Specialization;
            entity.YearsOfExperience = request.YearsOfExperience;
            entity.Rating = request.Rating;

            await _db.SaveChangesAsync(cancellationToken);

            var response = new TrainerResponse
            {
                Id = entity.Id,
                Name = entity.UserName,
                Email = entity.Email,
                PhoneNumber = entity.Phone,
                Specialization = entity.Specialization,
                YearsOfExperience = entity.YearsOfExperience,
                Rating = entity.Rating,
                CreatedAt = entity.CreatedAt,
                LastModifiedAt = entity.LastModifiedAt
            };

            return Result.Success("Updated successfully")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var entity = await _db.Set<Trainer>().FindAsync(id);

            if (entity == null)
                return Result.Failure("Not found");

            _db.Set<Trainer>().Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete: {ex.Message}");
        }
    }
}

