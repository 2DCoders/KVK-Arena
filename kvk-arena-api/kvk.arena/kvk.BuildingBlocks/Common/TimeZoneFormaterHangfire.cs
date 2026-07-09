namespace kvk.BuildingBlocks.Common;

public static class TimeZoneFormaterHangfire
{
    
    public static (DateTime LocalDate, DateTime LocalMidnight)
        GetBusinessDateInfo(TimeZoneInfo timeZone)
    {
        var now = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, timeZone);

        var localDate = now.Date;
        var localMidnight = DateTime.SpecifyKind(
            localDate,
            DateTimeKind.Unspecified);

        return (localDate, localMidnight);
    }

    public static DateTime ToLocalMidnight(DateTime localDate)
    {
        return DateTime.SpecifyKind(localDate.Date, DateTimeKind.Unspecified);
    }

    public static DateTime EnsureLocalKind(DateTime value)
    {
        if (value.Kind == DateTimeKind.Unspecified)
            return value;

        return DateTime.SpecifyKind(value, DateTimeKind.Unspecified);
    }

    public static TimeZoneInfo ResolveTimeZone(string? timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId))
            return TimeZoneInfo.Local;

        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (TimeZoneNotFoundException)
        {
            // _logger.LogWarning("Time zone '{TimeZoneId}' not found. Falling back to local time.", timeZoneId);
            return TimeZoneInfo.Local;
        }
        catch (InvalidTimeZoneException)
        {
            // _logger.LogWarning("Time zone '{TimeZoneId}' invalid. Falling back to local time.", timeZoneId);
            return TimeZoneInfo.Local;
        }
    }
}