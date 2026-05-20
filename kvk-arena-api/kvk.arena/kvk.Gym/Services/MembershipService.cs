using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using Microsoft.EntityFrameworkCore;
using kvk.Gym.Features.Memberships;

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
                // persist requested membership plan (default handled by DTO)
                MembershipPlan = request.MembershipPlan,
                Gender = request.Gender,
                DeviceFingerprintId1 = request.DeviceFingerprintId1,
                DeviceFingerprintId2 = request.DeviceFingerprintId2,
                // Display-only membership number must be set in initializer to satisfy required property rules
                MembershipNumber = MembershipNumberFormatter.Format(request.MemberType.ToString(), DateTime.UtcNow.Year)
            };

            // If both fingerprints null -> Inactive
            if (string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) && string.IsNullOrWhiteSpace(member.DeviceFingerprintId2))
                member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Inactive;
            else
                member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Active;

            _db.Memberships.Add(member);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlan = member.MembershipPlan.ToString(),
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
            var member = await _db.Memberships.SingleOrDefaultAsync(m => m.Id == memberId, cancellationToken);
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
                MembershipPlan = member.MembershipPlan.ToString(),
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
                .ToListAsync(cancellationToken);
            
            var response = memberships.Select(m => new MembershipResponse
            {
                Id = m.Id,
                MembershipNumber = m.MembershipNumber,
                FirstName = m.FirstName,
                LastName = m.LastName,
                Email = m.Email,
                PhoneNumber = m.Phone,
                DateOfBirth = m.DateOfBirth.ToString("dd/MM/yyyy"),
                MembershipStatus = m.MembershipStatus.ToString(),
                MembershipPlan = m.MembershipPlan.ToString(),
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
                .SingleOrDefaultAsync(m => m.Id == memberId, cancellationToken);

            if (member == null)
                return Result.Failure("Member not found");

            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlan = member.MembershipPlan.ToString(),
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
                existing.MembershipPlan = kvk.Gym.Enums.MembershipPlan.Monthly;
                await _db.SaveChangesAsync(cancellationToken);

                return Result.Success("Staff membership updated");
            }

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
                MembershipPlan = kvk.Gym.Enums.MembershipPlan.Monthly,
                MembershipNumber = MembershipNumberFormatter.Format("Staff", DateTime.UtcNow.Year)
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
}



