using kvk.Saloon.Features.Booking;
using kvk.Saloon.Domain;
using kvk.BuildingBlocks.Enums;

// Estimated end time and payment state cannot release an unfinished walk-in.
if (!BookingTimeRules.OccupiesSeatUntilCompleted(true, SaloonBookingStatus.Confirmed) ||
    !BookingTimeRules.OccupiesSeatUntilCompleted(true, SaloonBookingStatus.InProgress) ||
    BookingTimeRules.OccupiesSeatUntilCompleted(true, SaloonBookingStatus.Completed) ||
    BookingTimeRules.OccupiesSeatUntilCompleted(true, SaloonBookingStatus.Cancelled) ||
    BookingTimeRules.OccupiesSeatUntilCompleted(false, SaloonBookingStatus.Confirmed))
    throw new Exception("Walk-in capacity must stay occupied until completed or cancelled.");
var liveSeats = new[] { SaloonBookingStatus.Confirmed, SaloonBookingStatus.InProgress };
if (liveSeats.Count(status => !BookingTimeRules.OccupiesSeatUntilCompleted(true, status)) != 0)
    throw new Exception("Two unfinished walk-ins must block a third when there are two seats.");
liveSeats[1] = SaloonBookingStatus.Completed;
if (liveSeats.Count(status => !BookingTimeRules.OccupiesSeatUntilCompleted(true, status)) != 1)
    throw new Exception("Completing one service must release its live occupancy, even before payment.");
Console.WriteLine("PASS: Two active walk-ins block a third; completed unpaid services release live occupancy.");

var paymentCases = new (string Name, SaloonBookingStatus Status, bool Paid, PaymentType Method, bool Allowed)[]
{
    ("Arrival is unpaid and cannot collect before service", SaloonBookingStatus.Confirmed, false, PaymentType.Cash, false),
    ("Cannot collect during service", SaloonBookingStatus.InProgress, false, PaymentType.Cash, false),
    ("Completed unpaid walk-in accepts cash", SaloonBookingStatus.Completed, false, PaymentType.Cash, true),
    ("Completed unpaid walk-in accepts card", SaloonBookingStatus.Completed, false, PaymentType.CreditCard, true),
    ("Completed unpaid walk-in accepts debit card", SaloonBookingStatus.Completed, false, PaymentType.DebitCard, true),
    ("Repeated payment cannot charge again", SaloonBookingStatus.Completed, true, PaymentType.Cash, false),
    ("Cancelled services cannot collect payment", SaloonBookingStatus.Cancelled, false, PaymentType.Cash, false),
    ("Invalid payment method is rejected", SaloonBookingStatus.Completed, false, (PaymentType)0, false),
    ("Online payment cannot be recorded as terminal payment", SaloonBookingStatus.Completed, false, PaymentType.OnlinePayment, false),
};
foreach (var test in paymentCases)
{
    if (BookingPaymentRules.CanCollectPayment(test.Status, test.Paid, test.Method) != test.Allowed)
        throw new Exception($"FAIL: {test.Name}");
    Console.WriteLine($"PASS: {test.Name}");
}
if (!BookingPaymentRules.CanChangeServiceStatus(SaloonBookingStatus.Confirmed, SaloonBookingStatus.InProgress) ||
    !BookingPaymentRules.CanChangeServiceStatus(SaloonBookingStatus.InProgress, SaloonBookingStatus.Completed) ||
    BookingPaymentRules.CanChangeServiceStatus(SaloonBookingStatus.Confirmed, SaloonBookingStatus.Completed) ||
    BookingPaymentRules.CanChangeServiceStatus(SaloonBookingStatus.Completed, SaloonBookingStatus.InProgress))
    throw new Exception("Service must progress from confirmed to in progress to completed.");
Console.WriteLine("PASS: Valid service transitions accepted; skipping or reversing service progress is rejected.");

// Walk-ins reserve the same capacity as scheduled appointments.
var occupiedSeat = new[] { (TimeSpan.FromHours(12), TimeSpan.FromHours(13)) };
var emptySeat = Array.Empty<(TimeSpan Start, TimeSpan End)>();
var duringWalkInStart = TimeSpan.FromHours(12.25);
var duringWalkInEnd = TimeSpan.FromHours(12.75);
if (BookingTimeRules.IsSeatFree(occupiedSeat, duringWalkInStart, duringWalkInEnd, 15))
    throw new Exception("A walk-in must remove overlapping customer times for its seat.");
if (!BookingTimeRules.IsSeatFree(emptySeat, duringWalkInStart, duringWalkInEnd, 15))
    throw new Exception("Another empty seat must remain available.");
if (new[] { occupiedSeat, occupiedSeat }.Any(seat =>
    BookingTimeRules.IsSeatFree(seat, duringWalkInStart, duringWalkInEnd, 15)))
    throw new Exception("No customer time is available when every seat is occupied.");
if (!BookingTimeRules.IsSeatFree(occupiedSeat, TimeSpan.FromHours(13.25), TimeSpan.FromHours(14.25), 15))
    throw new Exception("A seat must become available after the walk-in and its gap.");
Console.WriteLine("PASS: Walk-in reserves a seat, preserves other seats, blocks full capacity, and releases after the gap.");

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
