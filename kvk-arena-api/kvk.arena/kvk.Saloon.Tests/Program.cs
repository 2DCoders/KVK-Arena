using kvk.Saloon.Features.Booking;

// Existing middle-of-day appointment: 10:00-11:00, with a 15-minute gap.
var cases = new (string Name, string Start, string End, int Gap, bool Conflict)[]
{
    ("Appointment overlapping the existing start", "09:45", "10:15", 15, true),
    ("Appointment inside the existing booking", "10:15", "10:45", 15, true),
    ("Start exactly at service end is blocked", "11:00", "11:30", 15, true),
    ("Start inside the post-booking gap is blocked", "11:14", "11:44", 15, true),
    ("Start exactly at end plus gap is allowed", "11:15", "11:45", 15, false),
    ("Later booking is allowed", "12:00", "12:30", 15, false),
    ("Earlier appointment ending at existing start is blocked", "09:30", "10:00", 15, true),
    ("Earlier appointment with insufficient gap is blocked", "09:16", "09:46", 15, true),
    ("Earlier appointment leaving exactly the gap is allowed", "09:15", "09:45", 15, false),
    ("Morning availability is preserved", "09:00", "09:30", 15, false),
    ("Long appointment crossing the booking is blocked", "09:00", "12:00", 15, true),
    ("Zero gap permits adjacent booking after", "11:00", "11:30", 0, false),
    ("Zero gap permits adjacent booking before", "09:30", "10:00", 0, false),
    ("Zero gap still blocks overlap", "10:30", "11:30", 0, true),
    ("Changed setting increases the required gap", "11:15", "11:45", 30, true),
    ("Changed setting allows exact new boundary", "11:30", "12:00", 30, false),
};
foreach (var test in cases)
{
    var actual = BookingTimeRules.OverlapsWithGap(TimeSpan.Parse("10:00"), TimeSpan.Parse("11:00"),
        TimeSpan.Parse(test.Start), TimeSpan.Parse(test.End), test.Gap);
    if (actual != test.Conflict)
        throw new Exception($"FAIL: {test.Name}: expected conflict={test.Conflict}, actual={actual}");
    Console.WriteLine($"PASS: {test.Name}");
}
Console.WriteLine($"All {cases.Length} salon booking gap checks passed.");

var timeCases = new (string Name, string Start, string End, bool Today, bool WalkIn, bool Allowed)[]
{
    ("Late haircut walk-in can finish after closing", "21:15", "22:15", true, true, true),
    ("Customer late haircut cannot finish after closing", "21:15", "22:15", true, false, false),
    ("Walk-in can record an earlier arrival today", "20:45", "21:45", true, true, true),
    ("Customer cannot book an elapsed start today", "20:45", "21:45", true, false, false),
    ("Future appointment can finish exactly at closing", "21:00", "22:00", false, false, true),
    ("Walk-in before opening is allowed", "08:30", "09:30", true, true, true),
    ("Customer before opening is blocked", "08:30", "09:30", false, false, false),
    ("Walk-in crossing midnight is blocked", "23:30", "1.00:30", true, true, false),
    ("Zero duration is blocked", "21:00", "21:00", true, true, false),
};
foreach (var test in timeCases)
{
    var actual = BookingTimeRules.IsStartAllowed(TimeSpan.Parse(test.Start), TimeSpan.Parse(test.End),
        TimeSpan.FromHours(9), TimeSpan.FromHours(22), test.Today, TimeSpan.FromHours(21), test.WalkIn);
    if (actual != test.Allowed)
        throw new Exception($"FAIL: {test.Name}: expected allowed={test.Allowed}, actual={actual}");
    Console.WriteLine($"PASS: {test.Name}");
}
