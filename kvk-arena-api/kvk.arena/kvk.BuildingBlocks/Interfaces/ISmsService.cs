using kvk.BuildingBlocks.Common;

namespace kvk.BuildingBlocks.Interfaces;

public interface ISmsService
{
    public Task<Result> SendSingleMessageAsync(string phoneNumber,string message,
        CancellationToken cancellationToken = default);
}