using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using kvk.Gym.Features.MembershipPlans;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gym.Services;

public class MembershipPlanService : IMembershipPlanService
{
    private readonly GymDbContext _db;

    public MembershipPlanService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(MembershipPlanCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Title))
            return Result.Failure("Title is required");

        if (request.Price < 0)
            return Result.Failure("Price cannot be negative");

        if (request.DurationInDays <= 0)
            return Result.Failure("Duration in days must be greater than zero");

        try
        {
            var plan = new MembershipPlan
            {
                Title = request.Title,
                Description = request.Description,
                Price = request.Price,
                DurationInDays = request.DurationInDays,
                IsActive = request.IsActive,
                Features = request.Features
            };

            _db.MembershipPlans.Add(plan);
            await _db.SaveChangesAsync(cancellationToken);

            var response = MapToResponse(plan);

            return Result.Success("Membership plan created")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create membership plan: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(Guid id, MembershipPlanUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Title))
            return Result.Failure("Title is required");

        if (request.Price < 0)
            return Result.Failure("Price cannot be negative");

        if (request.DurationInDays <= 0)
            return Result.Failure("Duration in days must be greater than zero");

        try
        {
            var plan = await _db.MembershipPlans
                .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);

            if (plan == null)
                return Result.Failure("Membership plan not found");

            plan.Title = request.Title;
            plan.Description = request.Description;
            plan.Price = request.Price;
            plan.DurationInDays = request.DurationInDays;
            plan.IsActive = request.IsActive;
            plan.Features = request.Features;

            await _db.SaveChangesAsync(cancellationToken);

            var response = MapToResponse(plan);

            return Result.Success("Membership plan updated")
                .WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update membership plan: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var plan = await _db.MembershipPlans
                .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);

            if (plan == null)
                return Result.Failure("Membership plan not found");

            _db.MembershipPlans.Remove(plan);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Membership plan deleted");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete membership plan: {ex.Message}");
        }
    }

    public async Task<Result> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var plan = await _db.MembershipPlans
                .AsNoTracking()
                .SingleOrDefaultAsync(p => p.Id == id, cancellationToken);

            if (plan == null)
                return Result.Failure("Membership plan not found");

            var response = MapToResponse(plan);

            return Result.Success().WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to fetch membership plan: {ex.Message}");
        }
    }

    public async Task<Result> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var plans = await _db.MembershipPlans
                .AsNoTracking()
                .OrderBy(p => p.Title)
                .ToListAsync(cancellationToken);

            var response = plans.Select(MapToResponse).ToList();

            return Result.Success().WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to fetch membership plans: {ex.Message}");
        }
    }

    private static MembershipPlanResponse MapToResponse(MembershipPlan plan)
    {
        return new MembershipPlanResponse
        {
            Id = plan.Id,
            Title = plan.Title,
            Description = plan.Description,
            Price = plan.Price,
            DurationInDays = plan.DurationInDays,
            IsActive = plan.IsActive,
            Features = plan.Features,
            CreatedAt = plan.CreatedAt,
            LastModifiedAt = plan.LastModifiedAt
        };
    }
}

