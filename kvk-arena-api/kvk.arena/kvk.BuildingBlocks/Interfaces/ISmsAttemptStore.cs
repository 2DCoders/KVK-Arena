namespace kvk.BuildingBlocks.Interfaces;

public enum SmsAttemptStatus { Pending, Accepted, Failed, Unknown }

public interface ISmsAttemptStore
{
    Task<Guid> StartAsync(string phoneNumber, bool adminBatch, CancellationToken cancellationToken);
    Task CompleteAsync(Guid id, SmsAttemptStatus status, int? segments, CancellationToken cancellationToken);
}
