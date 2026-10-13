using kvk.Saloon.Domain;

namespace kvk.Saloon.Features.Booking;

internal static class BookingTimeRules
{
    public static bool OccupiesSeatUntilCompleted(bool isWalkIn, SaloonBookingStatus status) =>
        status == SaloonBookingStatus.InProgress ||
        (isWalkIn && status == SaloonBookingStatus.Confirmed);

    public static bool IsSeatFree(IEnumerable<(TimeSpan Start, TimeSpan End)> reservations,
        TimeSpan requestedStart, TimeSpan requestedEnd, int gapMinutes) =>
        !reservations.Any(booking => OverlapsWithGap(booking.Start, booking.End,
            requestedStart, requestedEnd, gapMinutes));

    public static bool IsStartAllowed(TimeSpan start, TimeSpan end, TimeSpan open, TimeSpan close,
        bool isToday, TimeSpan now, bool isWalkIn)
    {
        if (start < TimeSpan.Zero || start >= TimeSpan.FromDays(1) || end <= start || end > TimeSpan.FromDays(1))
            return false;
        return isWalkIn || (start >= open && end <= close && (!isToday || start >= now));
    }

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
