using kvk.BuildingBlocks.Common;
using Microsoft.EntityFrameworkCore;
using kvk.Gym.Domain;
using kvk.Gym.Features.DayPassMembers;
using kvk.Gym.Interfaces;

namespace kvk.Gym.Services;

public class DayPassMemberService : IDayPassMemberService
{
    private readonly GymDbContext _db;

    public DayPassMemberService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(DayPassMemberCreateRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure("Name is required");

        if (string.IsNullOrWhiteSpace(request.MobileNumber))
            return Result.Failure("Mobile number is required");

        if (request.MembershipPlanId == Guid.Empty)
            return Result.Failure("Membership plan is required");

        try
        {
            var plan = await _db.MembershipPlans
                .SingleOrDefaultAsync(p => p.Id == request.MembershipPlanId, cancellationToken);

            if (plan == null)
                return Result.Failure("Membership plan not found");

            if (!string.Equals(plan.Title?.Trim(), "Day Pass", StringComparison.OrdinalIgnoreCase))
                return Result.Failure("Membership plan must be 'Day Pass'");

            var year = DateTime.UtcNow.Year;
            var token = await GetNextTempMembershipTokenAsync(year, cancellationToken);

            var dayPass = new DayPassMember
            {
                Name = request.Name,
                MobileNumber = request.MobileNumber,
                Date = request.Date,
                Amount = request.Amount,
                MembershipPlanId = request.MembershipPlanId,
                PaymentType = request.PaymentType,
                PaymentStatus = request.PaymentStatus,
                TemporaryMembershipNumber = MembershipNumberFormatter.Format("tempMember", year, token)
            };

            _db.DayPassMembers.Add(dayPass);
            await _db.SaveChangesAsync(cancellationToken);
            
            var response = MapToResponse(dayPass, plan.Title);

            return Result.Success("Day pass member created").WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create day pass member: {ex.Message}");
        }
    }

    public async Task<Result> UpdateAsync(Guid id, DayPassMemberUpdateRequest request, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        if (request == null)
            return Result.Failure("Request cannot be null");

        try
        {
            var existing = await _db.DayPassMembers
                .Include(d => d.MembershipPlan)
                .SingleOrDefaultAsync(d => d.Id == id, cancellationToken);

            if (existing == null)
                return Result.Failure("Day pass member not found");

            if (!string.IsNullOrWhiteSpace(request.Name))
                existing.Name = request.Name;
            if (!string.IsNullOrWhiteSpace(request.MobileNumber))
                existing.MobileNumber = request.MobileNumber;
            if (request.Date.HasValue)
                existing.Date = request.Date.Value;
            if (request.Amount.HasValue)
                existing.Amount = request.Amount.Value;
            if (request.PaymentType.HasValue)
                existing.PaymentType = request.PaymentType.Value;
            if (request.PaymentStatus.HasValue)
                existing.PaymentStatus = request.PaymentStatus.Value;

            await _db.SaveChangesAsync(cancellationToken);

            var response = MapToResponse(existing, existing.MembershipPlan?.Title);
            return Result.Success("Day pass member updated").WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update day pass member: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var existing = await _db.DayPassMembers.SingleOrDefaultAsync(d => d.Id == id, cancellationToken);
            if (existing == null)
                return Result.Failure("Day pass member not found");

            _db.DayPassMembers.Remove(existing);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Day pass member deleted");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete day pass member: {ex.Message}");
        }
    }

    public async Task<DayPassMemberResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return null;

        try
        {
            var existing = await _db.DayPassMembers
                .AsNoTracking()
                .Include(d => d.MembershipPlan)
                .SingleOrDefaultAsync(d => d.Id == id, cancellationToken);

            if (existing == null)
                return null;

            return MapToResponse(existing, existing.MembershipPlan?.Title);
        }
        catch
        {
            return null;
        }
    }

    public async Task<List<DayPassMemberResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var list = await _db.DayPassMembers
                .AsNoTracking()
                .Include(d => d.MembershipPlan)
                .Where(d => d.Date >= today && d.Date < tomorrow)
                .OrderByDescending(d => d.Date)
                .ToListAsync(cancellationToken);

            return list.Select(d => MapToResponse(d, d.MembershipPlan?.Title)).ToList();
        }
        catch
        {
            return new List<DayPassMemberResponse>();
        }
    }

    private static DayPassMemberResponse MapToResponse(DayPassMember d, string? planTitle)
    {
        return new DayPassMemberResponse
        {
            Id = d.Id,
            Name = d.Name,
            MobileNumber = d.MobileNumber,
            Date = d.Date,
            Amount = d.Amount,
            MembershipPlanId = d.MembershipPlanId,
            MembershipPlanTitle = planTitle,
            TemporaryMembershipNumber = d.TemporaryMembershipNumber,
            PaymentType = d.PaymentType.ToString(),
            PaymentStatus = d.PaymentStatus.ToString(),
            CreatedAt = d.CreatedAt,
            LastModifiedAt = d.LastModifiedAt
        };
    }

    private async Task<string> GetNextTempMembershipTokenAsync(int year, CancellationToken cancellationToken)
    {
        var prefix = $"GYM-TMP-{year}";

        var latest = await _db.DayPassMembers
            .AsNoTracking()
            .Where(d => !string.IsNullOrEmpty(d.TemporaryMembershipNumber) && d.TemporaryMembershipNumber!.StartsWith(prefix))
            .OrderByDescending(d => d.TemporaryMembershipNumber)
            .Select(d => d.TemporaryMembershipNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(latest))
            return "0001";

        var tokenPart = latest.Substring(latest.Length - 4);
        if (!int.TryParse(tokenPart, out var lastToken))
            return "0001";

        var next = lastToken + 1;
        return next.ToString("D4");
    }
}

