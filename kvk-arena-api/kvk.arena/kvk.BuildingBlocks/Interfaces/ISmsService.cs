using kvk.BuildingBlocks.Common;
using kvk.BuildingBlocks.Services;

namespace kvk.BuildingBlocks.Interfaces;

public interface ISmsService
{
    public Task<Result> SendSingleMessageAsync(string phoneNumber,string message,
        CancellationToken cancellationToken = default);
    
    public Task<Result> SendBulkMessageAsync(IEnumerable<SmsService.BulkSmsItem> messages,
        CancellationToken cancellationToken = default);
}