using kvk.Badminton.Domain;

namespace kvk.Badminton.Features.MemberBooking;

public record SessionAvailability(DateOnly Date, string Status);
public record SlotAvailability(Guid SlotId, string StartTime, string EndTime, int AvailableCount, int TotalCount,
    bool AvailableEveryWeek, List<SessionAvailability> Sessions);
public record CashierAvailabilityResponse(DateOnly StartDate, DateOnly EndDate, int Weeks, List<DateOnly> Dates, List<SlotAvailability> Slots);

public static class MemberAvailability
{
    // Legacy recurring reservations cover [start, start + weeks * 7), on their selected weekdays only.
    public static bool BlocksDate(DateOnly date, DateOnly start, int weeks, DayOfWeek weekday) =>
        weeks > 0 && date >= start && (long)date.DayNumber - start.DayNumber < (long)weeks * 7 && date.DayOfWeek == weekday;

    public static string Status(DateOnly date, Guid slotId, TimeOnly startTime, DateTime localNow,
        IReadOnlyDictionary<(Guid SlotId, DateOnly Date), string> taken)
    {
        if (date < DateOnly.FromDateTime(localNow) || date == DateOnly.FromDateTime(localNow) && startTime <= TimeOnly.FromDateTime(localNow)) return "past";
        return taken.TryGetValue((slotId, date), out var status) ? status : "available";
    }

    public static List<SlotAvailability> Slots(IReadOnlyList<DateOnly> dates, IReadOnlyList<CourtSlot> slots,
        DateTime localNow, IReadOnlyDictionary<(Guid SlotId, DateOnly Date), string> taken) =>
        slots.OrderBy(slot => slot.StartTime).Select(slot =>
        {
            var sessions = dates.Select(date => new SessionAvailability(date, Status(date, slot.Id, slot.StartTime, localNow, taken))).ToList();
            var available = sessions.Count(session => session.Status == "available");
            return new SlotAvailability(slot.Id, slot.StartTime.ToString("HH:mm"), slot.EndTime.ToString("HH:mm"),
                available, sessions.Count, sessions.Count > 0 && available == sessions.Count, sessions);
        }).ToList();
}
