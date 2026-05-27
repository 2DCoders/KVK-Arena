namespace kvk.BuildingBlocks.Common;

public class Result
{
    private Result(bool succeeded, string message, string[] errors)
    {
        Succeeded = succeeded;
        Errors = errors;
        Message = message;
        TraceCode = Guid.NewGuid();
        DateTime = DateTime.Now;
        AdditionalData = new Dictionary<string,dynamic>();
    }

    private Result(string message)
    {
        Succeeded = false;
        IsPending = true;
        Errors = [];
        Message = message;
        TraceCode = Guid.NewGuid();
        DateTime = DateTime.Now;
        AdditionalData = new Dictionary<string, dynamic>();
    }

    public bool Succeeded { get; set; }
    public bool IsPending { get; set; }
    public Guid TraceCode { get; set; }
    public DateTime DateTime { get; set; }
    public string Message { get; set; }
    public string[] Errors { get; set; }

    public Dictionary<string, dynamic> AdditionalData { get; set; }

    public static Result Success() =>
        new Result(true, "Operation is success", []);

    public static Result Success(string message) =>
        new Result(true, message, []);

    public static Result Pending(string message = "Operation is going on") =>
        new Result(message);

    public static Result Failure(params string[] errors) =>
        new Result(false, "Operation is failed", errors);

    public static Result Failure(string message, params string[] errors) =>
        new Result(false, message, errors);

    public Result WithData(string key, object value)
    {
        if(!AdditionalData.TryAdd(key, value))
            AdditionalData[key] = value;

        return this;
    }
}