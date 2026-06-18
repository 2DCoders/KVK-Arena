using kvk.BuildingBlocks.Common;
using kvk.Gym.Domain;
using kvk.Gym.Enums;
using kvk.Gym.Features.Trainers;
using Microsoft.EntityFrameworkCore;

namespace kvk.Gym.Features.TrainersApprovalRequest;

public class TrainerApprovalRequestService
{
    private readonly GymDbContext _db;

    public TrainerApprovalRequestService(GymDbContext db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<Result> CreateAsync(TrainerApprovalRequestCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request == null)
            return Result.Failure("Request cannot be null");

        if (string.IsNullOrWhiteSpace(request.UserName))
            return Result.Failure("Name is required");

        if (string.IsNullOrWhiteSpace(request.Email))
            return Result.Failure("Email is required");

        byte[]? profilePictureByteArray = null;
        if (request.ProfilePicture != null)
        {
            using var memoryStream = new MemoryStream();
            await request.ProfilePicture.CopyToAsync(memoryStream, cancellationToken);
            profilePictureByteArray = memoryStream.ToArray();
        }

        try
        {
            var entity = new TrainerApprovalRequests
            {
                UserName = request.UserName,
                Email = request.Email,
                Phone = request.PhoneNumber,
                Specialization = request.Specialization,
                YearsOfExperience = request.YearsOfExperience,
                FirstName = request.FirstName,
                LastName = request.LastName,
                PasswordHash = string.Empty, // Password handling is out of scope for this example
                Status = "Active",
                ApprovalStatus = ApprovalStatus.Pending,
                ApprovedBy = string.Empty,
                ApprovalDate = DateTime.MaxValue,
                TrainerId = request.Id,
                ProfilePicture = profilePictureByteArray,
                Role = request.Role,
                IsFreelance = request.IsFreelance,
            };

            _db.Set<TrainerApprovalRequests>().Add(entity);
            await _db.SaveChangesAsync(cancellationToken);

            var response = new TrainerApprovalRequestResponse
            {
                Id = entity.Id,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                UserName = entity.UserName,
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
    //this is for request for updating 
    public async Task<Result> UpdateAsync(Guid? id, TrainerApprovalRequstUpdateRequest request,
        CancellationToken cancellationToken = default)
    {

        if (request == null)
            return Result.Failure("Request cannot be null");

        try
        {
            byte[]? profilePictureByteArray = null;
            if (request.ProfilePicture != null)
            {
                using var memoryStream = new MemoryStream();
                await request.ProfilePicture.CopyToAsync(memoryStream, cancellationToken);
                profilePictureByteArray = memoryStream.ToArray();
            }

            if (id == null || id == Guid.Empty)
            {
                var newEntity = new TrainerApprovalRequests
                {
                    UserName = request.UserName,
                    Email = request.Email,
                    Phone = request.PhoneNumber,
                    Specialization = request.Specialization,
                    YearsOfExperience = request.YearsOfExperience,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    PasswordHash = string.Empty, // Password handling is out of scope for this example
                    Status = "Active",
                    ApprovalStatus = ApprovalStatus.Pending,
                    ApprovedBy = string.Empty,
                    ApprovalDate = DateTime.MaxValue,
                    TrainerId = id,
                    ProfilePicture = profilePictureByteArray,
                    Role = request.Role,
                    IsFreelance = request.IsFreelance,
                };

                _db.Set<TrainerApprovalRequests>().Add(newEntity);
                await _db.SaveChangesAsync(cancellationToken);
            }
            else
            {
                

                var entity = await _db.Set<TrainerApprovalRequests>()
                    .SingleAsync(
                        x =>
                            x.TrainerId == id
                            && x.ApprovalStatus == ApprovalStatus.Pending,
                        cancellationToken);

                var trainerId = await _db.Set<Trainer>()
                    .Where(x => x.Id == id)
                    .SingleOrDefaultAsync(cancellationToken);

                if (trainerId == null)
                {
                    return Result.Failure("Trainer not found");

                }

                if (entity != null)
                {
                    if (request.UserName != null)
                        entity.UserName = request.UserName;

                    if (request.FirstName != null)
                        entity.FirstName = request.FirstName;

                    if (request.LastName != null)
                        entity.LastName = request.LastName;

                    if (request.Email != null)
                        entity.Email = request.Email;

                    if (request.PhoneNumber != null)
                        entity.Phone = request.PhoneNumber;

                    if (request.Specialization != null)
                        entity.Specialization = request.Specialization;

                    if (request.YearsOfExperience != 0)
                        entity.YearsOfExperience = request.YearsOfExperience;

                    if (request.Rating != 0)
                        entity.Rating = request.Rating;
                    
                    if (request.DateOfBirth != null)
                        entity.DateOfBirth = request.DateOfBirth.Value;

                    if (request.Gender != null)
                        entity.Gender = request.Gender.Value;

                    if (profilePictureByteArray != null)
                        entity.ProfilePicture = profilePictureByteArray;

                    if (request.Role != null)
                        entity.Role = request.Role;

                    if (request.IsFreelance)
                        entity.IsFreelance = request.IsFreelance;
                    
                    entity.TrainerId = trainerId.Id;
                }
            }

            await _db.SaveChangesAsync(cancellationToken);


            return Result.Success("Updated successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to update: {ex.Message}");
        }
    }


    public async Task<Result> GetPendingRecordByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var entity = await _db.Set<TrainerApprovalRequests>()
                .AsNoTracking()
                .Where(x => x.ApprovalStatus == ApprovalStatus.Pending)
                .SingleOrDefaultAsync(x => x.TrainerId == id, cancellationToken);

            if (entity == null)
                return Result.Failure("Not found");

            var response = new TrainerApprovalRequestResponse
            {
                Id = entity.Id,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                UserName = entity.UserName,
                Email = entity.Email,
                PhoneNumber = entity.Phone,
                ProfilePicture = entity.ProfilePicture,
                Role = entity.Role,
                IsFreelance = entity.IsFreelance,
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
            var entities = await _db.Set<TrainerApprovalRequests>()
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            var response = entities.Select(entity => new TrainerApprovalRequestResponse
            {
                Id = entity.Id,
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                UserName = entity.UserName,
                Email = entity.Email,
                PhoneNumber = entity.Phone,
                Specialization = entity.Specialization,
                YearsOfExperience = entity.YearsOfExperience,
                Rating = entity.Rating,
                ProfilePicture = entity.ProfilePicture,
                Role = entity.Role,
                IsFreelance = entity.IsFreelance,
                CreatedAt = entity.CreatedAt,
                LastModifiedAt = entity.LastModifiedAt,
                ApprovalStatus = entity.ApprovalStatus,
                ApprovalDate = entity.ApprovalDate,
                ApprovedBy = entity.ApprovedBy
            }).ToList();

            return Result.Success().WithData("response", response);
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to fetch: {ex.Message}");
        }
    }


    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var entity = await _db.Set<TrainerApprovalRequests>()
                .SingleAsync(
                    x => x.Id == id && x.ApprovalStatus == ApprovalStatus.Pending,
                    cancellationToken);
            
            if (entity == null)
                return Result.Failure("Not found");

            _db.Set<TrainerApprovalRequests>().Remove(entity);
            await _db.SaveChangesAsync(cancellationToken);

            return Result.Success("Deleted successfully");
        }
        catch (Exception ex)
        {
            return Result.Failure($"Failed to delete: {ex.Message}");
        }
    }
//this is fo admin
    public async Task<Result> ApproveAsync(Guid id,ApprovalStatus approvalStatus, CancellationToken cancellationToken = default)
    {
        if (id == Guid.Empty)
            return Result.Failure("Id cannot be empty");

        try
        {
            var entity = await _db.Set<TrainerApprovalRequests>()
                .SingleAsync(
                    x => x.TrainerId == id && x.ApprovalStatus == ApprovalStatus.Pending,
                    cancellationToken);


            switch (approvalStatus)
            {
                case ApprovalStatus.Rejected:
                    entity.ApprovalStatus = approvalStatus;
                    entity.ApprovalDate = DateTime.Now;
                    entity.ApprovedBy = "Admin";
                    break;
                case ApprovalStatus.Approved when entity.TrainerId == null:
                {
                    //create a new record in trainer table 
                    
                    entity.TrainerId = id;
                    
                    var trainer = new Trainer
                    {
                        Id = entity.TrainerId.Value,
                        UserName = entity.UserName,
                        Email = entity.Email,
                        Phone = entity.Phone,
                        Specialization = entity.Specialization,
                        YearsOfExperience = entity.YearsOfExperience,
                        FirstName = entity.FirstName,
                        LastName = entity.LastName,
                        PasswordHash = entity.PasswordHash,
                        Status = "Active",
                        Rating = entity.Rating,
                        ProfilePicture = entity.ProfilePicture,
                        Role = entity.Role,
                        IsFreelance = entity.IsFreelance,
                    };
                    
                    _db.Set<Trainer>().Add(trainer);
                    
                    var memberToken = await GetNextMembershipTokenAsync(nameof(MemberType.Trainer), DateTime.UtcNow.Year,
                        cancellationToken);
                    
                    // and add a record for member table as well
                    var member = new Membership
                    {
                        Id = entity.TrainerId.Value,
                        UserName = entity.UserName,
                        Email = entity.Email,
                        Phone = entity.Phone,
                        FirstName = entity.FirstName,
                        LastName = entity.LastName,
                        PasswordHash = entity.PasswordHash,
                        Status = "Active",
                        DateOfBirth = entity.DateOfBirth,
                        Gender = entity.Gender,
                        // ProfilePicture = entity.ProfilePicture,
                        // Role = entity.Role,
                        MembershipNumber = MembershipNumberFormatter.Format(nameof(MemberType.Trainer),
                            DateTime.UtcNow.Year, memberToken)
                    };
                    
                    _db.Set<Membership>().Add(member);
                    
                    entity.ApprovalStatus = ApprovalStatus.Approved;
                    entity.ApprovalDate = DateTime.Now;
                    entity.ApprovedBy = "Admin";
                    
                    break;
                }
                case ApprovalStatus.Approved:
                {
                    // update the exist record in trainer table
                    var trainer = await _db.Set<Trainer>()
                        .SingleAsync(x => x.Id == entity.TrainerId.Value, cancellationToken);
                    
                    if (trainer == null)
                        return Result.Failure("Trainer not found");
                    
                    trainer.UserName = entity.UserName;
                    trainer.Email = entity.Email;
                    trainer.Phone = entity.Phone;
                    trainer.Specialization = entity.Specialization;
                    trainer.YearsOfExperience = entity.YearsOfExperience;
                    trainer.FirstName = entity.FirstName;
                    trainer.LastName = entity.LastName;
                    trainer.PasswordHash = entity.PasswordHash;
                    trainer.Status = "Active";
                    trainer.Rating = entity.Rating;
                    trainer.ProfilePicture = entity.ProfilePicture;
                    trainer.Role = entity.Role;
                    trainer.IsFreelance = entity.IsFreelance;
                    
                    //and then again update member table
                    
                    var member = await _db.Set<Membership>()
                        .SingleAsync(x => x.Id == entity.TrainerId.Value, cancellationToken);
                    
                    member.UserName = entity.UserName;
                    member.Email = entity.Email;
                    member.Phone = entity.Phone;
                    member.FirstName = entity.FirstName;
                    member.LastName = entity.LastName;
                    member.PasswordHash = entity.PasswordHash;
                    member.Status = "Active";
                    member.DateOfBirth = member.DateOfBirth;
                    member.Gender = entity.Gender;
                    break;
                }
            }
            
            await _db.SaveChangesAsync(cancellationToken);
            
            var existingRequest = _db.TrainerApprovalRequests.Where(t => t.TrainerId == entity.TrainerId)
                .FirstOrDefaultAsync(cancellationToken);
            
            if (existingRequest != null)
                _db.TrainerApprovalRequests.Remove(await existingRequest);
            
            await _db.SaveChangesAsync(cancellationToken);
            
            return Result.Success("Approved");
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
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


}