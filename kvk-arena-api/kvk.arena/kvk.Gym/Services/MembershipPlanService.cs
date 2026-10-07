using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
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

        if (IsDayPass(request.Title) && request.IsActive != ActiveStatus.Active)
            return Result.Failure("Day Pass must be active");

        try
        {
            if (IsDayPass(request.Title) && await _db.MembershipPlans
                    .AnyAsync(p => p.Title.Trim().ToLower() == "day pass", cancellationToken))
                return Result.Failure("Day Pass already exists");

            var plan = new MembershipPlan
            {
                Title = IsDayPass(request.Title) ? "Day Pass" : request.Title.Trim(),
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

            if (IsDayPass(plan.Title))
                return Result.Failure("Day Pass cannot be edited or deactivated");

            if (IsDayPass(request.Title))
                return Result.Failure("An existing plan cannot be renamed to Day Pass");

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

            if (IsDayPass(plan.Title))
                return Result.Failure("Day Pass cannot be deleted");

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

    public async Task<Result> GetAllAsync(CancellationToken cancellationToken = default, bool activeOnly = false)
    {
        try
        {
            var plans = await _db.MembershipPlans
                .AsNoTracking()
                .Where(p => !activeOnly || p.IsActive == ActiveStatus.Active)
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

    private static bool IsDayPass(string title) =>
        string.Equals(title.Trim(), "Day Pass", StringComparison.OrdinalIgnoreCase);

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

