using kvk.BuildingBlocks.Common;

namespace kvk.Identity.Features.CustomerFeedBack;

public interface ICustomerFeedBackService
{
    Task<Result> CreateCustomerFeedBackAsync(CustomerFeedBackCreateRequest request, CancellationToken cancellationToken = default);
    
    Task<CustomerFeedBackResponse> GetCustomerFeedBackByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    Task<List<CustomerFeedBackResponse>> GetAllCustomerFeedBacksAsync(CancellationToken cancellationToken = default);
    
}