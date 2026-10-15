using System.ComponentModel.DataAnnotations;
using kvk.Badminton.Features.MemberBooking;
using kvk.Badminton.Features.CourtBookingTemporary;
using kvk.BuildingBlocks.Common;

var checks = 0;
void Assert(bool value, string message) { if (!value) throw new Exception(message); checks++; }
var start = new DateOnly(2027, 1, 1);
Assert(MemberSchedule.EndDate(start, 12) == new DateOnly(2027, 3, 25), "End date must be inclusive.");
var dates = MemberSchedule.Dates(start, 12, [DaysOfWeek.Monday, DaysOfWeek.Friday]);
Assert(dates.Count == 24, "Two weekdays for 12 weeks must produce 24 exact booking dates.");
Assert(dates.All(d => d >= start && d <= MemberSchedule.EndDate(start, 12)), "Sessions must stay inside the booking period.");
Assert(dates.All(d => d.DayOfWeek is DayOfWeek.Monday or DayOfWeek.Friday), "Only selected weekdays may be booked.");
Assert(MemberSchedule.EndDate(new DateOnly(2028, 2, 26), 1) == new DateOnly(2028, 3, 3), "Leap day must be included.");
Assert(MemberSchedule.Dates(start, 1, [DaysOfWeek.Friday]).Single() == start, "A matching start day must be booked.");
Assert(ReservationCouponPricing.Discount([100m, 200m, 300m], 50m, 2) == 150m, "Coupon cap must use actual slot prices.");
Assert(ReservationCouponPricing.Discount([100m, 200m], 100m, 20) == 300m, "A full coupon can cover all selected slots.");
Assert(ReservationCouponPricing.Discount([100m], 0m, 20) == 0m, "An eligible unused coupon can have zero badminton discount.");
Assert(ReservationCouponPricing.Discount([100m], 200m, 20) == 100m, "Discount cannot exceed the full price.");
Assert(ReservationCouponPricing.Discount([.01m], 50m, 20) == .01m, "Coupon amounts must round consistently.");
foreach (var discount in new[] { 0m, .01m, 100m, 300m }) {
  var amounts = MemberSchedule.Amounts([100m, 100m, 100m], discount);
  Assert(amounts.Sum() == 300m - discount && amounts.All(a => a >= 0), "Booking rows must sum exactly to the discounted total.");
}
Assert(MemberSchedule.Amounts([0m, 0m], 0m).Sum() == 0m, "Free configured slots must not divide by zero.");
var request = new MemberConfirmRequest { HoldToken = Guid.NewGuid(), CustomerName = "Test", Email = "test@example.com", PhoneNumber = "0771234567", CouponCode = "" };
var errors = new List<ValidationResult>();
Assert(!Validator.TryValidateObject(request, new ValidationContext(request), errors, true), "A coupon must be required at confirmation.");
request.CouponCode = "UNUSED";
errors.Clear();
Assert(Validator.TryValidateObject(request, new ValidationContext(request), errors, true), "Customer details and coupon are sufficient without a member ID.");
request.PhoneNumber = "invalid";
errors.Clear();
Assert(!Validator.TryValidateObject(request, new ValidationContext(request), errors, true), "Invalid customer phone numbers must be rejected.");


var options = new kvk.BuildingBlocks.PayHereOptions { MerchantId = "merchant", MerchantSecret = "test-secret", Currency = "LKR" };
var hashes = new kvk.BuildingBlocks.Services.HashService();
var notification = new PaymentNotificationRequest { MerchantId = "merchant", OrderId = "MBR-order", PayhereAmount = 900m, PayhereCurrency = "LKR", StatusCode = 2 };
notification.Md5Sig = hashes.GenerateNotificationMd5Sig(notification.MerchantId, options.MerchantSecret, notification.OrderId, notification.PayhereAmount, notification.PayhereCurrency, notification.StatusCode);
Assert(MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "LKR"), "Matching signed payment must verify.");
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "another-order", 900m, "LKR"), "A signature for another order must not confirm this booking.");
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 901m, "LKR"), "A mismatched paid amount must not confirm this booking.");
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "USD"), "A mismatched currency must not confirm this booking.");
notification.StatusCode = -1;
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "LKR"), "A tampered status must invalidate the signature.");
notification.StatusCode = 2;
notification.Md5Sig = "forged";
Assert(!MemberPaymentSecurity.Verify(notification, options, hashes, "MBR-order", 900m, "LKR"), "Unsigned browser claims must not confirm payment.");
Assert(typeof(MemberBadmintonBookingController).GetMethod("Confirm") is null, "There must be no public unpaid booking confirmation endpoint.");
Console.WriteLine($"Passed {checks} member badminton booking checks.");
