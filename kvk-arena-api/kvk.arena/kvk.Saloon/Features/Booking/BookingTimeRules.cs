namespace kvk.Saloon.Features.Booking;

internal static class BookingTimeRules
{
    public static bool OverlapsWithGap(TimeSpan existingStart, TimeSpan existingEnd,
        TimeSpan requestedStart, TimeSpan requestedEnd, int gapMinutes)
    {
        var gap = TimeSpan.FromMinutes(Math.Max(0, gapMinutes));
        // Reserve the gap after either appointment, including when a new booking
        // is inserted before an existing one. Exact gap boundaries are available.
        return existingStart < requestedEnd.Add(gap) &&
               existingEnd.Add(gap) > requestedStart;
    }
}
