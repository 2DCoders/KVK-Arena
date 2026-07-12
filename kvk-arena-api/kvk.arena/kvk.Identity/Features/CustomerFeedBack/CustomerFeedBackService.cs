using kvk.BuildingBlocks.Common;
using kvk.Identity.Persistence;
using Microsoft.EntityFrameworkCore;
using Throw;

namespace kvk.Identity.Features.CustomerFeedBack;

public class CustomerFeedBackService : ICustomerFeedBackService
{
    private readonly IdentityApplicationDbContext _db;

    public CustomerFeedBackService(IdentityApplicationDbContext db)
    {
        _db = db;
    }


    public async Task<Result> CreateCustomerFeedBackAsync(CustomerFeedBackCreateRequest request,
        CancellationToken cancellationToken = default)
    {
        var feedBack = new Domain.CustomerFeedBack
        {
            Name = request.Name,
            Email = request.Email,
            FeedBack = request.FeedBack,
            Phone = request.Phone
        };

        _db.CustomerFeedBacks.Add(feedBack);
        await _db.SaveChangesAsync(cancellationToken);


        return Result.Success("Customer FeedBack Created");
    }


    public async Task<CustomerFeedBackResponse> GetCustomerFeedBackByIdAsync(Guid id,
        CancellationToken cancellationToken = default)
    {
        var feedBack =  await _db.CustomerFeedBacks
            .Where(x => x.Id == id)
            .Select(x => new CustomerFeedBackResponse
            {
                Id = x.Id,
                Name = x.Name,
                Email = x.Email,
                FeedBack = x.FeedBack,
                Phone = x.Phone
            })
            .FirstOrDefaultAsync(cancellationToken);

        feedBack.ThrowIfNull("Customer FeedBack Not Found");

        return feedBack;
    }

    public async Task<List<CustomerFeedBackResponse>> GetAllCustomerFeedBacksAsync(
        CancellationToken cancellationToken = default)
    {
        var feedBacks =  await _db.CustomerFeedBacks
            .Select(x => new CustomerFeedBackResponse
            {
                Id = x.Id,
                Name = x.Name,
                Email = x.Email,
                FeedBack = x.FeedBack,
                Phone = x.Phone
            })
            .ToListAsync(cancellationToken);

        feedBacks.ThrowIfNull("Customer FeedBack Not Found");

        return feedBacks;
    }
}