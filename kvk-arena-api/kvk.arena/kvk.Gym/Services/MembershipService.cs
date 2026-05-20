using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using Microsoft.EntityFrameworkCore;
using kvk.Gym.Features.Memberships;
using System.Security.Cryptography;

namespace kvk.Gym.Services;

public class MembershipService : IMembershipService
{
    private readonly GymDbContext _db;

    public MembershipService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateMemberAsync(CreateMembershipRequest request, CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        try
        {
            MembershipPlan? plan = null;

            if (request.MemberType == kvk.Gym.Enums.MemberType.Client)
            {
                if (!request.MembershipPlanId.HasValue || request.MembershipPlanId == Guid.Empty)
                    return Result.Failure("Membership plan is required for clients");

                plan = await _db.MembershipPlans
                    .SingleOrDefaultAsync(p => p.Id == request.MembershipPlanId, cancellationToken);

                if (plan == null)
                    return Result.Failure("Membership plan not found");

                if (plan.IsActive != kvk.Gym.Enums.ActiveStatus.Active)
                    return Result.Failure("Membership plan is inactive");
            }
            else if (request.MembershipPlanId.HasValue && request.MembershipPlanId != Guid.Empty)
            {
                plan = await _db.MembershipPlans
                    .SingleOrDefaultAsync(p => p.Id == request.MembershipPlanId, cancellationToken);

                if (plan == null)
                    return Result.Failure("Membership plan not found");
            }

            var memberToken = await GetNextMembershipTokenAsync(request.MemberType.ToString(), DateTime.UtcNow.Year, cancellationToken);

            var member = new Membership
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                UserName = request.Email ?? $"{request.FirstName}.{request.LastName}.{Guid.NewGuid()}",
                PasswordHash = string.Empty,
                Status = "Active",
                DateOfBirth = request.DateOfBirth,
                MemberType = request.MemberType,
                MembershipPlanId = plan?.Id,
                Gender = request.Gender,
                DeviceFingerprintId1 = request.DeviceFingerprintId1,
                DeviceFingerprintId2 = request.DeviceFingerprintId2,
                Otp = GenerateOtp(),
                // Display-only membership number must be set in initializer to satisfy required property rules
                MembershipNumber = MembershipNumberFormatter.Format(request.MemberType.ToString(), DateTime.UtcNow.Year, memberToken)
            };

            // If both fingerprints null -> Inactive
            if (string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) && string.IsNullOrWhiteSpace(member.DeviceFingerprintId2))
                member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Inactive;
            else
                member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Active;

            _db.Memberships.Add(member);
            await _db.SaveChangesAsync(cancellationToken);

            if (member.MemberType == kvk.Gym.Enums.MemberType.Client && plan != null)
            {
                var startDate = DateTime.UtcNow;

                var payment = new MemberPayment
                {
                    MembershipId = member.Id,
                    Amount = plan.Price,
                    PaymentType = kvk.Gym.Enums.PaymentType.Cash,
                    PaymentStatus = kvk.Gym.Enums.PaymentStatus.Pending,
                    MemberShipStartDate = startDate,
                    MemberShipEndDate = startDate.AddDays(plan.DurationInDays)
                };

                _db.MemberPayments.Add(payment);
                await _db.SaveChangesAsync(cancellationToken);
            }

            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlanId = plan?.Id,
                MembershipPlanTitle = plan?.Title,
                MembershipPlanPrice = plan?.Price,
                MembershipPlanDurationInDays = plan?.DurationInDays,
                IdentityUserId = member.IdentityUserId
            };

            return Result.Success("Member created").WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to create member: {ex.Message}");
        }
    }

    public async Task<Result> UpdateFingerprintsAsync(Guid memberId, UpdateFingerprintsRequest request, CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships
                .Include(m => m.MembershipPlan)
                .SingleOrDefaultAsync(m => m.Id == memberId, cancellationToken);
            if (member == null)
                return Result.Failure("Member not found");

            if (!string.IsNullOrWhiteSpace(request.DeviceFingerprintId1))
                member.DeviceFingerprintId1 = request.DeviceFingerprintId1;
            if (!string.IsNullOrWhiteSpace(request.DeviceFingerprintId2))
                member.DeviceFingerprintId2 = request.DeviceFingerprintId2;

            // activation rule: trainers/staff can be activated immediately; clients are activated when fingerprints present
            if (member.MemberType == kvk.Gym.Enums.MemberType.Client)
            {
                if (!string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) || !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2))
                    member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Active;
            }
            else
            {
                member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Active;
            }

            await _db.SaveChangesAsync(cancellationToken);

            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlanId = member.MembershipPlanId,
                MembershipPlanTitle = member.MembershipPlan?.Title,
                MembershipPlanPrice = member.MembershipPlan?.Price,
                MembershipPlanDurationInDays = member.MembershipPlan?.DurationInDays,
                IdentityUserId = member.IdentityUserId
            };

            return Result.Success("Fingerprints updated").WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update fingerprints: {ex.Message}");
        }
    }

    public async Task<List<MembershipResponse>> GetAllMembersAsync(CancellationToken cancellationToken = default)
    {  
        try
        {
            var memberships = await _db.Memberships
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .ToListAsync(cancellationToken);
            
            var response = memberships.Select(m => new MembershipResponse
            {
                Id = m.Id,
                MembershipNumber = m.MembershipNumber,
                FirstName = m.FirstName,
                LastName = m.LastName,
                Email = m.Email,
                PhoneNumber = m.Phone ?? string.Empty,
                DateOfBirth = m.DateOfBirth.ToString("dd/MM/yyyy"),
                Gender = m.Gender,
                MembershipStatus = m.MembershipStatus.ToString(),
                MembershipPlanId = m.MembershipPlanId,
                MembershipPlanTitle = m.MembershipPlan?.Title,
                MembershipPlanPrice = m.MembershipPlan?.Price,
                MembershipPlanDurationInDays = m.MembershipPlan?.DurationInDays,
                IdentityUserId = m.IdentityUserId
            }).ToList();
            
            return response;
            
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch members: {ex.Message}");
        }
    }

    public async Task<Result> GetMemberAsync(Guid memberId, CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .SingleOrDefaultAsync(m => m.Id == memberId, cancellationToken);

            if (member == null)
                return Result.Failure("Member not found");

            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlanId = member.MembershipPlanId,
                MembershipPlanTitle = member.MembershipPlan?.Title,
                MembershipPlanPrice = member.MembershipPlan?.Price,
                MembershipPlanDurationInDays = member.MembershipPlan?.DurationInDays,
                IdentityUserId = member.IdentityUserId
            };

            return Result.Success().WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to fetch member: {ex.Message}");
        }
    }

    public async Task<Result> EnsureMembershipForStaffAsync(string identityUserId, string email, string fullName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(identityUserId))
            return Result.Failure("identityUserId is required");

        try
        {
            var existing = await _db.Memberships.SingleOrDefaultAsync(m => m.IdentityUserId == identityUserId, cancellationToken);
            if (existing != null)
            {
                // update basic info
                existing.Email = email;
                existing.FirstName = fullName?.Split(' ').FirstOrDefault() ?? existing.FirstName;
                existing.LastName = fullName?.Split(' ').Skip(1).FirstOrDefault() ?? existing.LastName;
                existing.MemberType = kvk.Gym.Enums.MemberType.Staff;
                existing.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Active;
                existing.MembershipPlanId = null;
                await _db.SaveChangesAsync(cancellationToken);

                return Result.Success("Staff membership updated");
            }

            var memberToken = await GetNextMembershipTokenAsync("Staff", DateTime.UtcNow.Year, cancellationToken);

            var member = new Membership
            {
                IdentityUserId = identityUserId,
                FirstName = fullName?.Split(' ').FirstOrDefault() ?? string.Empty,
                LastName = fullName?.Split(' ').Skip(1).FirstOrDefault() ?? string.Empty,
                Email = email ?? string.Empty,
                UserName = email ?? $"staff.{Guid.NewGuid()}",
                PasswordHash = string.Empty,
                Status = "Active",
                MemberType = kvk.Gym.Enums.MemberType.Staff,
                MembershipStatus = kvk.Gym.Enums.MembershipStatus.Active,
                MembershipPlanId = null,
                MembershipNumber = MembershipNumberFormatter.Format("Staff", DateTime.UtcNow.Year, memberToken)
            };

            _db.Memberships.Add(member);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Staff membership created");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to ensure staff membership: {ex.Message}");
        }
    }

    private static int GenerateOtp()
    {
        return RandomNumberGenerator.GetInt32(1000, 10000);
    }

    private async Task<string> GetNextMembershipTokenAsync(string memberTypeName, int year, CancellationToken cancellationToken)
    {
        var prefix = GetMembershipPrefix(memberTypeName);
        var yearPrefix = $"{prefix}-{year}";

        var latestNumber = await _db.Memberships
            .AsNoTracking()
            .Where(m => m.MembershipNumber.StartsWith(yearPrefix))
            .OrderByDescending(m => m.MembershipNumber)
            .Select(m => m.MembershipNumber)
            .FirstOrDefaultAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(latestNumber))
            return "0001";

        var tokenPart = latestNumber.Substring(latestNumber.Length - 4);
        if (!int.TryParse(tokenPart, out var lastToken))
            return "0001";

        var nextToken = lastToken + 1;
        return nextToken.ToString("D4");
    }

    private static string GetMembershipPrefix(string memberTypeName)
    {
        return memberTypeName?.ToLowerInvariant() switch
        {
            "client" => "GYM-MEM",
            "trainer" => "GYM-TRA",
            "staff" => "GYM-STA",
            _ => "GYM-UNK"
        };
    }
}
