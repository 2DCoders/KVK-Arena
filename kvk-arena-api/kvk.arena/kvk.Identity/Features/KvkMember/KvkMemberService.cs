using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Constants;
using kvk.BuildingBlocks.Enums;
using kvk.BuildingBlocks.Interfaces;
using kvk.BuildingBlocks.Services;
using kvk.Identity.Domain;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Throw;

namespace kvk.Identity.Features.KvkMember;

public class KvkMemberService(IdentityApplicationDbContext db, ISmsService smsService) : IKvkMemberService
{
    private readonly IdentityApplicationDbContext _db = db ?? throw new ArgumentNullException(nameof(db));
    private readonly ISmsService _smsService = smsService;

    public async Task<Result> RegisterAsync(KvkMemberRegisterRequest request, CancellationToken cancellationToken)
    {
        var memberToken = await GetNextMembershipTokenAsync(DateTime.UtcNow.Year,
            cancellationToken);


        byte[]? profilePictureBytes = null;
        if (request.ProfilePicture != null)
        {
            using var memoryStream = new MemoryStream();
            await request.ProfilePicture.CopyToAsync(memoryStream, cancellationToken);
            profilePictureBytes = memoryStream.ToArray();
        }


        var exists = await _db.KvkMembers
            .AnyAsync(x => x.UserName == request.UserName || x.Email == request.Email, cancellationToken);

        if (request.NicNumber != null)
        {
            exists = await _db.KvkMembers
                .AnyAsync(x => x.NicNumber == request.NicNumber, cancellationToken);
            if (exists)
            {
                return Result.Failure("A member with the same nic number already exists.");
            }
        }

        if (exists)
        {
            return Result.Failure("A member with the same username or email already exists.");
        }

        var member = new Domain.KvkMember
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            UserName = request.UserName,
            Email = request.Email,
            Phone = request.Phone,
            PasswordHash = PasswordEncryption.HashPassword(request.PasswordHash),
            Gender = request.Gender,
            ProfilePicture = profilePictureBytes,
            MemberId = MembershipNumberFormatter.KvkMemberFormat(DateTime.UtcNow.Year, memberToken),
            MembershipStatus = MemberShipActiveStatus.Inactive,
            IsPaid = false,
            Status = request.Status
        };

        _db.KvkMembers.Add(member);
        await _db.SaveChangesAsync(cancellationToken);

        await _smsService.SendSingleMessageAsync(member.Phone!,
            MessageList.GetKvkMemberRegistrationMessage(member.FirstName, member.MemberId), cancellationToken);

        return Result.Success();
    }

    public async Task<List<KvkMemberResponse>> GetMembersAsync(CancellationToken cancellationToken)
    {
        return await _db.KvkMembers
            .AsNoTracking()
            .Select(m => new KvkMemberResponse
            {
                Id = m.Id,
                UserName = m.UserName,
                FirstName = m.FirstName,
                LastName = m.LastName,
                Email = m.Email,
                MemberId = m.MemberId,
                MembershipStatus = m.MembershipStatus,
                IsPaid = m.IsPaid,
                StartDate = m.StartDate,
                EndDate = m.EndDate,
                Status = m.Status,
                NicNumber = m.NicNumber,
                Phone = m.Phone,
                Gender = m.Gender
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<KvkMemberResponse> GetMemberByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var member = await _db.KvkMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        member.ThrowIfNull("Member not found.");

        return new KvkMemberResponse
        {
            Id = member.Id,
            FirstName = member.FirstName,
            UserName = member.UserName,
            LastName = member.LastName,
            Email = member.Email,
            MemberId = member.MemberId,
            MembershipStatus = member.MembershipStatus,
            IsPaid = member.IsPaid,
            StartDate = member.StartDate,
            EndDate = member.EndDate,
            Status = member.Status,
            NicNumber = member.NicNumber,
            Phone = member.Phone,
            Gender = member.Gender
        };
    }

    public async Task<Result> DeleteMemberAsync(Guid id, CancellationToken cancellationToken)
    {
        var member = await _db.KvkMembers.FindAsync(new object[] { id }, cancellationToken);

        member.ThrowIfNull("Member not found.");

        _db.KvkMembers.Remove(member);
        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> RecordMemberAsPaidAsync(MemberPayRequest request, CancellationToken cancellationToken)
    {
        var member = await _db.KvkMembers.FindAsync(new object[] { request.MemberId }, cancellationToken);
        member.ThrowIfNull("Member not found.");

        member.IsPaid = request.IsPaid;
        member.StartDate = request.StartDate;
        member.EndDate = request.EndDate;
        member.MembershipDurationDays = 365;
        member.MembershipStatus = MemberShipActiveStatus.Active;
        member.IsPaid = true;

        //assign member offer rate to the specifc member
        var offers = await _db.OfferRates.Where
            (x => x.OfferType == OfferType.MembershipOffer).ToListAsync(cancellationToken);

        //assign MemberEligileOFfer
        foreach (var offer in offers)
        {
            var memberEligibleOffer = new MemberEligibleOffer
            {
                Id = Guid.NewGuid(),
                MemberId = member.Id,
                OfferRateId = offer.Id,
                IsEligible = true,
            };
            _db.MemberEligibleOffers.Add(memberEligibleOffer);
        }

        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> ActiveOrDeactivateMemberAsync(Guid id, bool isActive, CancellationToken cancellationToken)
    {
        var member = await _db.KvkMembers.FindAsync(new object[] { id }, cancellationToken);

        member.ThrowIfNull("Member not found.");

        member.MembershipStatus = isActive ? MemberShipActiveStatus.Active : MemberShipActiveStatus.Inactive;

        await _db.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> SendSmsCouponCodeBulkAsync(CancellationToken cancellationToken)
    {
        
        var eligibleMembersWithCouponCodes = await _db.MemberEligibleOffers
            .Include(m => m.Member)
            .Include(m => m.OfferRate)
            .Where(m => m.IsEligible && !m.IsRedeemed && m.CouponCode != null)
            .Select(m => new SmsService.BulkSmsItem
            {
                PhoneNumber = m.Member.Phone!,
                Message = MessageList.GetKvkMemberCouponCodeMessage(m.Member.FirstName, m.CouponCode!)
            })
            .ToListAsync(cancellationToken);
        
        await _smsService.SendBulkMessageAsync(eligibleMembersWithCouponCodes, cancellationToken);
        
        return Result.Success("SMS sent successfully");
        
    }

    public async Task<Result> SendSmsCouponCodeSingleAsync(string memberId, CancellationToken cancellationToken)
    {
        var eligibleMemberWithCouponCodes = await _db.MemberEligibleOffers
            .Include(m => m.Member)
            .Include(m => m.OfferRate)
            .Where(m => m.IsEligible && !m.IsRedeemed && m.CouponCode != null && m.Member.MemberId == memberId)
            .Select(m => new
            {
                FirstName = m.Member.FirstName,
                PhoneNumber = m.Member.Phone!,
                CouponCode = m.CouponCode
            })
            .FirstOrDefaultAsync(cancellationToken);
        
        await _smsService.SendSingleMessageAsync(eligibleMemberWithCouponCodes!.PhoneNumber,MessageList.GetKvkMemberCouponCodeMessage(eligibleMemberWithCouponCodes.FirstName, eligibleMemberWithCouponCodes.CouponCode!), cancellationToken);
        
        return Result.Success("SMS sent successfully");
    }


    private async Task<string> GetNextMembershipTokenAsync(int year,
        CancellationToken cancellationToken)
    {
        var yearPrefix = $"KVK-MEM-{year}";

        var latestNumber = await _db.KvkMembers
            .AsNoTracking()
            .Where(m => m.MemberId.StartsWith(yearPrefix))
            .OrderByDescending(m => m.MemberId)
            .Select(m => m.MemberId)
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