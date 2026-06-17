using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using Microsoft.EntityFrameworkCore;
using kvk.Gym.Features.Memberships;
using kvk.Gym.Interfaces;
using System.Security.Cryptography;
using kvk.BuildingBlocks.Auth;
using kvk.BuildingBlocks.Constants;
using kvk.BuildingBlocks.Interfaces;
using kvk.Gym.Enums;

namespace kvk.Gym.Services;

public class MembershipService : IMembershipService
{
    private readonly GymDbContext _db;
    private readonly ISmsService _smsService;
    private readonly IJwtService _jwtService;
    private readonly IPermissionAuthorizationService _permissionService;

    public MembershipService(GymDbContext db, ISmsService smsService, IJwtService jwtService,
        IPermissionAuthorizationService permissionService)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
        _smsService = smsService;
        _jwtService = jwtService;
        _permissionService = permissionService;
    }

    public async Task<Result> CreateMemberAsync(CreateMembershipRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        try
        {
            var existingMember = await _db.Memberships
                .AnyAsync(m => m.Email == request.Email, cancellationToken);
            if (existingMember) return Result.Failure("Email is already registered");


            if (string.IsNullOrWhiteSpace(request.Password))
                return Result.Failure("Password is required");

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

            var memberToken = await GetNextMembershipTokenAsync(request.MemberType.ToString(), DateTime.UtcNow.Year,
                cancellationToken);

            var member = new Membership
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                UserName = request.Email ?? $"{request.FirstName}.{request.LastName}.{Guid.NewGuid()}",
                PasswordHash = PasswordEncryption.HashPassword(request.Password),
                Status = "Active",
                DateOfBirth = request.DateOfBirth,
                MemberType = request.MemberType,
                MembershipPlanId = plan?.Id,
                Gender = request.Gender,
                DeviceFingerprintId1 = request.DeviceFingerprintId1,
                DeviceFingerprintId2 = request.DeviceFingerprintId2,
                Otp = GenerateOtp(),
                MembershipNumber =
                    MembershipNumberFormatter.Format(request.MemberType.ToString(), DateTime.UtcNow.Year, memberToken)
            };

            // If both fingerprints null -> Inactive
            if (string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) &&
                string.IsNullOrWhiteSpace(member.DeviceFingerprintId2))
                member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Inactive;
            else
                member.MembershipStatus = kvk.Gym.Enums.MembershipStatus.Active;

            _db.Memberships.Add(member);
            await _db.SaveChangesAsync(cancellationToken);

            if (member.MemberType != kvk.Gym.Enums.MemberType.Staff && plan != null)
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

                // Also create an immutable payment record for analytics/audit
                var record = new PaymentRecord
                {
                    MembershipId = member.Id,
                    MemberPaymentId = null,
                    Amount = payment.Amount,
                    PaymentType = payment.PaymentType,
                    PaymentStatus = payment.PaymentStatus,
                    MemberShipStartDate = payment.MemberShipStartDate,
                    MemberShipEndDate = payment.MemberShipEndDate,
                    TransactionReference = payment.TransactionReference,
                    MembershipNumber = member.MembershipNumber,
                    MembershipPlanId = plan?.Id,
                    MembershipPlanTitle = plan?.Title
                };

                _db.PaymentRecords.Add(record);

                await _db.SaveChangesAsync(cancellationToken);

                await _smsService.SendSingleMessageAsync(member.Phone!, MessageList
                    .GetWelcomeMessage(member.FirstName, member.MembershipNumber), cancellationToken);
            }

            if (member.MemberType == kvk.Gym.Enums.MemberType.Trainer)
            {
                var trainer = new Trainer
                {
                    Id = member.Id,
                    UserName = member.UserName,
                    FirstName = member.FirstName,
                    LastName = member.LastName,
                    Email = member.Email,
                    Status = "Active",
                    PasswordHash = member.PasswordHash,
                    Phone = member.Phone
                };

                _db.Trainers.Add(trainer);
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


    public async Task<MemberLoginResponse> LoginAsync(MemberLoginRequest request, CancellationToken cancellationToken)
    {
        if (request == null)
            throw new ArgumentNullException(nameof(request));

        if (string.IsNullOrWhiteSpace(request.Username))
            throw new ArgumentNullException(nameof(request.Username));

        if (string.IsNullOrWhiteSpace(request.Password))
            throw new ArgumentNullException(nameof(request.Password));

        try
        {
            var membership = await _db.Set<Membership>()
                .SingleOrDefaultAsync(s => s.UserName == request.Username && s.MemberType != MemberType.Staff,
                    cancellationToken);

            if (membership == null)
                throw new Exception("Invalid username or password");

            if (!PasswordEncryption.VerifyPassword(request.Password, membership.PasswordHash))
                throw new Exception("Invalid username or password");

            if (membership.IsDeleted)
                throw new Exception("You account has been removed. Please contact administrator.");

            // Get user permissions
            var permissions = (await _permissionService.GetUserPermissions(membership.Id, cancellationToken)).ToArray();


            // Generate JWT token
            var token = _jwtService.GenerateToken(membership.Id, permissions);

            var response = new MemberLoginResponse
            {
                MemberId = membership.Id,
                Token = token,
                Email = membership.Email,
                Username = membership.UserName,
                FirstName = membership.FirstName,
                LastName = membership.LastName,
                MemberType = membership.MemberType
            };

            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to login: {ex.Message}");
        }
    }

    public async Task<Result> ChangePasswordAsync(Guid memberId, string oldPassword, string newPassword,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(oldPassword))
            throw new ArgumentException("Old password is required.", nameof(oldPassword));
        if (string.IsNullOrWhiteSpace(newPassword))
            throw new ArgumentException("New password is required.", nameof(newPassword));

        try
        {
            var member = await _db.Set<Membership>()
                .SingleOrDefaultAsync(s => s.Id == memberId, cancellationToken);

            if (member == null)
                throw new Exception("Member not found");

            if (!PasswordEncryption.VerifyPassword(oldPassword, member.PasswordHash))
                throw new Exception("Invalid old password");

            member.PasswordHash = PasswordEncryption.HashPassword(newPassword);
            _db.Set<Membership>().Update(member);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Password changed successfully");
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<Result> UpdateFingerprintsAsync(Guid memberId, UpdateFingerprintsRequest request,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships
                .Include(m => m.MembershipPlan)
                .SingleOrDefaultAsync(m => m.Id == memberId && !m.IsDeleted, cancellationToken);
            if (member == null)
                return Result.Failure("Member not found");

            if (!string.IsNullOrWhiteSpace(request.DeviceFingerprintId1))
                member.DeviceFingerprintId1 = request.DeviceFingerprintId1;
            if (!string.IsNullOrWhiteSpace(request.DeviceFingerprintId2))
                member.DeviceFingerprintId2 = request.DeviceFingerprintId2;

            // activation rule: trainers/staff can be activated immediately; clients are activated when fingerprints present
            if (member.MemberType == kvk.Gym.Enums.MemberType.Client)
            {
                if (!string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) ||
                    !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2))
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
                .Where(m => !m.IsDeleted)
                .Include(m => m.MembershipPlan)
                .Include(m => m.MemberPayments) // include payments so projection can access them
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
                PaymentStatus = m.MemberPayments
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => p.PaymentStatus)
                    .FirstOrDefault(),
                MembershipStatus = m.MembershipStatus.ToString(),
                MembershipPlanId = m.MembershipPlanId,
                MembershipPlanTitle = m.MembershipPlan?.Title,
                MembershipPlanPrice = m.MembershipPlan?.Price,
                MembershipPlanDurationInDays = m.MembershipPlan?.DurationInDays,
                IdentityUserId = m.IdentityUserId,
                IsDeleted = m.IsDeleted
            }).ToList();

            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch members: {ex.Message}");
        }
    }

    public async Task<MembershipResponse> GetMemberAsync(Guid memberId, CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            throw new ArgumentException("Member id cannot be empty", nameof(memberId));
        try
        {
            var member = await _db.Memberships
                .AsNoTracking()
                .Include(m => m.MembershipPlan)
                .SingleOrDefaultAsync(m => m.Id == memberId && !m.IsDeleted, cancellationToken);

            if (member == null)
                throw new Exception("Member not found");

            var latestPayment = await _db.MemberPayments
                .AsNoTracking()
                .Where(p => p.MembershipId == memberId)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            Trainer trainer = null;
            TrainerSpecializedResponse trainerSpecializedResponse = null;
            if (member.TrainerId.HasValue)
            {
                trainer = (await _db.Trainers.Where(t => t.Id == member.TrainerId)
                    .FirstOrDefaultAsync(cancellationToken))!;
            }

            if (member.MemberType == MemberType.Trainer)
            {
                //get the trainer details
                trainerSpecializedResponse = (await _db.Trainers.Where(t => t.Id == member.Id)
                    .Select(x => new TrainerSpecializedResponse
                    {
                        Specialization = x.Specialization,
                        Rating = x.Rating,
                        YearsOfExperience = x.YearsOfExperience,
                        ProfilePicture = x.ProfilePicture
                    })
                    .FirstOrDefaultAsync(cancellationToken))!;
            }


            var memberPayment = await _db.MemberPayments.Where(p => p.MembershipId == member.Id)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Email = member.Email,
                PhoneNumber = member.Phone ?? string.Empty,
                DateOfBirth = member.DateOfBirth.ToString("dd/MM/yyyy"),
                Gender = member.Gender,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlanId = member.MembershipPlanId,
                MembershipPlan = member.MembershipPlan,
                MemberPayment = memberPayment,
                MembershipPlanTitle = member.MembershipPlan?.Title,
                MembershipPlanPrice = member.MembershipPlan?.Price,
                MembershipStartDate = latestPayment?.MemberShipStartDate,
                MembershipEndDate = latestPayment?.MemberShipEndDate,
                PaymentStatus = latestPayment?.PaymentStatus ?? kvk.Gym.Enums.PaymentStatus.Pending,
                MembershipPlanDurationInDays = member.MembershipPlan?.DurationInDays,
                RewardPoints = member.Points,
                AssignedTrainer = trainer != null ? $"{trainer.FirstName} {trainer.LastName}" : null,
                IdentityUserId = member.IdentityUserId,
                CreatedDate = member.CreatedAt,
                IsSavedFingerprints = !string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) ||
                                      !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2),
                Specialization = trainerSpecializedResponse?.Specialization,
                YearsOfExperience = trainerSpecializedResponse?.YearsOfExperience ?? 0,
                ProfilePicture = trainerSpecializedResponse?.ProfilePicture,
                Rating = trainerSpecializedResponse?.Rating ?? 0
            };

            return response;
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to fetch member: {ex.Message}");
        }
    }

    public async Task<Result> EnsureMembershipForStaffAsync(string identityUserId, string email, string fullName,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(identityUserId))
            return Result.Failure("identityUserId is required");

        try
        {
            var existing =
                await _db.Memberships.SingleOrDefaultAsync(m => m.IdentityUserId == identityUserId && !m.IsDeleted,
                    cancellationToken);
            if (existing != null)
            {
                if (email != existing.Email)
                {
                    var anotherMemberWithEmail = await _db.Memberships.AnyAsync(
                        m => m.Email == email && m.IdentityUserId != identityUserId, cancellationToken);
                    if (anotherMemberWithEmail)
                    {
                        return Result.Failure("Email is already registered");
                    }
                }

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

            var emailExists = await _db.Memberships.AnyAsync(m => m.Email == email, cancellationToken);
            if (emailExists)
            {
                return Result.Failure("Email is already registered");
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

    public async Task<Result> EditMemberAsync(Guid memberId, EditMembershipRequest request,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        if (request == null)
            return Result.Failure("Request cannot be null");

        try
        {
            var member = await _db.Memberships
                .Include(m => m.MembershipPlan)
                .SingleOrDefaultAsync(m => m.Id == memberId && !m.IsDeleted, cancellationToken);
            if (member == null)
                return Result.Failure("Member not found");

            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != member.Email)
            {
                var existingMember = await _db.Memberships
                    .AnyAsync(m => m.Email == request.Email && m.Id != memberId, cancellationToken);
                if (existingMember)
                    return Result.Failure("Email is already registered");
            }

            if (!string.IsNullOrWhiteSpace(request.FirstName))
                member.FirstName = request.FirstName;
            if (!string.IsNullOrWhiteSpace(request.LastName))
                member.LastName = request.LastName;
            if (!string.IsNullOrWhiteSpace(request.Phone))
                member.Phone = request.Phone;
            if (request.DateOfBirth.HasValue)
                member.DateOfBirth = request.DateOfBirth.Value;
            if (request.Gender.HasValue)
                member.Gender = request.Gender.Value;

            //Edit Trainer info if member is trainer
            if (member.MemberType == kvk.Gym.Enums.MemberType.Trainer)
            {
                var trainer = await _db.Trainers.SingleOrDefaultAsync(t => t.Id == memberId, cancellationToken);
                if (trainer != null)
                {
                    if (request.YearsOfExperience.HasValue)
                        trainer.YearsOfExperience = request.YearsOfExperience.Value;
                    if (!string.IsNullOrWhiteSpace(request.Specialization))
                        trainer.Specialization = request.Specialization;
                    if (!string.IsNullOrWhiteSpace(request.FirstName))
                        member.FirstName = request.FirstName;
                    if (!string.IsNullOrWhiteSpace(request.LastName))
                        member.LastName = request.LastName;
                    if (!string.IsNullOrWhiteSpace(request.Phone))
                        member.Phone = request.Phone;
                    if (request.DateOfBirth.HasValue)
                        member.DateOfBirth = request.DateOfBirth.Value;
                    if (request.Gender.HasValue)
                        member.Gender = request.Gender.Value;

                    _db.Trainers.Update(trainer);
                }
            }


            await _db.SaveChangesAsync(cancellationToken);

            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Email = member.Email,
                PhoneNumber = member.Phone ?? string.Empty,
                DateOfBirth = member.DateOfBirth.ToString("dd/MM/yyyy"),
                Gender = member.Gender,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlanId = member.MembershipPlanId,
                MembershipPlanTitle = member.MembershipPlan?.Title,
                MembershipPlanPrice = member.MembershipPlan?.Price,
                MembershipPlanDurationInDays = member.MembershipPlan?.DurationInDays,
                IdentityUserId = member.IdentityUserId,
                IsSavedFingerprints = !string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) ||
                                      !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2)
            };

            return Result.Success("Member updated").WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update member: {ex.Message}");
        }
    }

    public async Task<Result> UpgradeMembershipPlanAsync(Guid memberId, UpgradeMembershipPlanRequest request,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        if (request == null || request.MembershipPlanId == Guid.Empty)
            return Result.Failure("MembershipPlanId is required");

        try
        {
            var member = await _db.Memberships
                .Include(m => m.MembershipPlan)
                .SingleOrDefaultAsync(m => m.Id == memberId && !m.IsDeleted, cancellationToken);
            if (member == null)
                return Result.Failure("Member not found");

            var plan = await _db.MembershipPlans.SingleOrDefaultAsync(p => p.Id == request.MembershipPlanId,
                cancellationToken);
            if (plan == null)
                return Result.Failure("Membership plan not found");

            if (plan.IsActive != kvk.Gym.Enums.ActiveStatus.Active)
                return Result.Failure("Membership plan is inactive");

            // Update membership plan on the member
            member.MembershipPlanId = plan.Id;

            // Determine start/end/renewal dates for the new plan
            var startDate = DateTime.UtcNow;
            var renewalDate = DateTime.UtcNow;
            var endDate = startDate.AddDays(plan.DurationInDays);

            // Try to update the latest payment if it's pending — keep history otherwise by creating a new payment
            var latestPayment = await _db.MemberPayments
                .Where(p => p.MembershipId == member.Id)
                .OrderByDescending(p => p.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            MemberPayment payment;
            if (latestPayment != null && latestPayment.MemberShipEndDate > DateTime.Now)
            {
                // update existing pending payment to reflect new plan amount and dates
                latestPayment.Amount = plan.Price;
                latestPayment.PaymentType = request.PaymentType;
                latestPayment.MemberShipStartDate = startDate;
                latestPayment.MemberShipRenewalDate = renewalDate;
                latestPayment.MemberShipEndDate = endDate;
                latestPayment.PaymentStatus = kvk.Gym.Enums.PaymentStatus.Paid;

                payment = latestPayment;
            }
            else if (latestPayment != null && latestPayment.MemberShipEndDate < DateTime.Now)
            {
                latestPayment.Amount = plan.Price;
                latestPayment.PaymentType = request.PaymentType;

                var newStartDate = latestPayment.MemberShipEndDate.Value;

                latestPayment.MemberShipStartDate = newStartDate;
                latestPayment.MemberShipRenewalDate = renewalDate;
                latestPayment.MemberShipEndDate = newStartDate.AddDays(plan.DurationInDays);
                latestPayment.PaymentStatus = kvk.Gym.Enums.PaymentStatus.Paid;
            }


            await _db.SaveChangesAsync(cancellationToken);

            // Record the payment action in the immutable PaymentRecords table
            try
            {
                var record = new PaymentRecord
                {
                    MembershipId = member.Id,
                    MemberPaymentId = latestPayment.Id,
                    Amount = latestPayment.Amount,
                    PaymentType = latestPayment.PaymentType,
                    PaymentStatus = latestPayment.PaymentStatus,
                    MemberShipStartDate = latestPayment.MemberShipStartDate,
                    MemberShipEndDate = latestPayment.MemberShipEndDate,
                    MemberShipRenewalDate = latestPayment.MemberShipRenewalDate,
                    TransactionReference = latestPayment.TransactionReference,
                    MembershipNumber = member.MembershipNumber,
                    MembershipPlanId = member.MembershipPlanId,
                    MembershipPlanTitle = plan.Title
                };

                _db.PaymentRecords.Add(record);
                await _db.SaveChangesAsync(cancellationToken);
            }
            catch
            {
                // Non-fatal: if recording fails, do not block the upgrade flow
            }

            var message = MessageList.GetPlanUpgradedMessage(member.FirstName, plan.Title,
                latestPayment.MemberShipStartDate,
                latestPayment.MemberShipEndDate);
            await _smsService.SendSingleMessageAsync(member.Phone!, message, cancellationToken);


            // prepare response including the new payment dates
            var response = new MembershipResponse
            {
                Id = member.Id,
                MembershipNumber = member.MembershipNumber,
                FirstName = member.FirstName,
                LastName = member.LastName,
                Email = member.Email,
                PhoneNumber = member.Phone ?? string.Empty,
                DateOfBirth = member.DateOfBirth.ToString("dd/MM/yyyy"),
                Gender = member.Gender,
                MembershipStatus = member.MembershipStatus.ToString(),
                MembershipPlanId = member.MembershipPlanId,
                MembershipPlanTitle = plan.Title,
                MembershipPlanPrice = plan.Price,
                MembershipStartDate = latestPayment.MemberShipStartDate,
                MembershipEndDate = latestPayment.MemberShipEndDate,
                PaymentStatus = latestPayment.PaymentStatus,
                MembershipPlanDurationInDays = plan.DurationInDays,
                IdentityUserId = member.IdentityUserId,
                IsSavedFingerprints = !string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) ||
                                      !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2)
            };

            return Result.Success("Membership plan upgraded").WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to upgrade membership plan: {ex.Message}");
        }
    }

    private static int GenerateOtp()
    {
        return RandomNumberGenerator.GetInt32(1000, 10000);
    }

    public async Task<Result> SoftDeleteMemberAsync(Guid memberId, CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships
                .SingleOrDefaultAsync(m => m.Id == memberId && !m.IsDeleted, cancellationToken);

            if (member == null)
                return Result.Failure("Member not found");

            member.IsDeleted = true;
            member.DeletedAt = DateTime.UtcNow;

            if (member.MemberType == kvk.Gym.Enums.MemberType.Trainer)
            {
                var trainer = await _db.Trainers.SingleOrDefaultAsync(t => t.Id == memberId, cancellationToken);

                if (trainer == null)
                    return Result.Failure("Trainer not found");
                trainer.IsDeleted = true;
                trainer.DeletedAt = DateTime.UtcNow;
            }


            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Member soft-deleted");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to soft-delete member: {ex.Message}");
        }
    }


    public async Task<Result> ReverseSoftDeleteMemberAsync(Guid memberId,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships
                .SingleOrDefaultAsync(m => m.Id == memberId && m.IsDeleted, cancellationToken);

            if (member == null)
                return Result.Failure("Member not found");

            member.IsDeleted = false;
            member.DeletedAt = DateTime.UtcNow;

            if (member.MemberType == kvk.Gym.Enums.MemberType.Trainer)
            {
                var trainer = await _db.Trainers.SingleOrDefaultAsync(t => t.Id == memberId, cancellationToken);

                if (trainer == null)
                    return Result.Failure("Trainer not found");
                trainer.IsDeleted = false;
                trainer.DeletedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Reversed Member soft-deleted");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to Reverse soft-delete member: {ex.Message}");
        }
    }


    public async Task<Result> PermanentlyDeleteMemberAsync(Guid memberId,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        try
        {
            var member = await _db.Memberships
                .SingleOrDefaultAsync(m => m.Id == memberId && !m.IsDeleted, cancellationToken);

            if (member == null)
                return Result.Failure("Member not found");

            // Business rule: permanent delete only allowed when there is at least one pending payment
            // AND there are no saved fingerprints on the member.
            var hasPendingPayment = await _db.MemberPayments
                .AnyAsync(p => p.MembershipId == memberId && p.PaymentStatus == kvk.Gym.Enums.PaymentStatus.Pending,
                    cancellationToken);

            var hasFingerprints = !string.IsNullOrWhiteSpace(member.DeviceFingerprintId1) ||
                                  !string.IsNullOrWhiteSpace(member.DeviceFingerprintId2);

            if (!hasPendingPayment || hasFingerprints)
                return Result.Failure(
                    "Permanent delete is allowed only for members with pending payments and no saved fingerprints");


            // With cascade delete configured for MemberPayments and MemberAttendances, removing the membership
            // will delete related payments and attendances automatically.
            _db.Memberships.Remove(member);

            if (member.MemberType == kvk.Gym.Enums.MemberType.Trainer)
            {
                var trainer = await _db.Trainers.SingleOrDefaultAsync(t => t.Id == memberId, cancellationToken);
                if (trainer == null)
                    return Result.Failure("Trainer not found");

                _db.Trainers.Remove(trainer);
            }

            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Member permanently deleted");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to permanently delete member: {ex.Message}");
        }
    }

    private async Task<string> GetNextMembershipTokenAsync(string memberTypeName, int year,
        CancellationToken cancellationToken)
    {
        var prefix = MembershipNumberFormatter.GetMembershipPrefix(memberTypeName);
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


    public async Task<Result> AssignTrainerAsync(Guid memberId, Guid trainerId,
        CancellationToken cancellationToken = default)
    {
        if (memberId == Guid.Empty)
            return Result.Failure("Member id cannot be empty");

        if (trainerId == Guid.Empty)
            return Result.Failure("Trainer id cannot be empty");

        try
        {
            var member = await _db.Memberships.FindAsync(memberId);
            if (member == null)
                return Result.Failure("Member not found");

            var trainer = await _db.Set<Trainer>().FindAsync(trainerId);
            if (trainer == null)
                return Result.Failure("Trainer not found");

            member.TrainerId = trainerId;
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Trainer assigned successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to assign trainer: {ex.Message}");
        }
    }
}